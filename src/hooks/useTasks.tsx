import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  status: 'today' | 'later' | 'completed';
  subtasks?: Subtask[];
  notes?: TaskNote[];
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskNote {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async (date?: string) => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          subtasks(*),
          task_notes(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('due_date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedTasks = (data || []).map(task => ({
        ...task,
        status: task.status as 'today' | 'later' | 'completed',
        subtasks: task.subtasks || [],
        notes: task.task_notes || []
      }));
      
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, description?: string, due_date?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title,
            description,
            due_date: due_date || new Date().toISOString().split('T')[0],
            user_id: user.id,
          },
        ])
        .select(`
          *,
          subtasks(*),
          task_notes(*)
        `)
        .single();

      if (error) throw error;

      const transformedTask = {
        ...data,
        status: data.status as 'today' | 'later' | 'completed',
        subtasks: data.subtasks || [],
        notes: data.task_notes || []
      };
      
      setTasks((prev) => [transformedTask, ...prev]);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      return transformedTask;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          subtasks(*),
          task_notes(*)
        `)
        .single();

      if (error) throw error;

      const transformedTask = {
        ...data,
        status: data.status as 'today' | 'later' | 'completed',
        subtasks: data.subtasks || [],
        notes: data.task_notes || []
      };

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? transformedTask : task))
      );
      return transformedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const updates: Partial<Task> = {
      completed,
      completed_at: completed ? new Date().toISOString() : undefined,
    };
    return updateTask(id, updates);
  };

  const moveTaskToTomorrow = async (id: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const due_date = tomorrow.toISOString().split('T')[0];
    return updateTask(id, { due_date });
  };

  const moveTaskToLater = async (id: string) => {
    return updateTask(id, { status: 'later' });
  };

  const moveTaskToToday = async (id: string) => {
    return updateTask(id, { status: 'today' });
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const createSubtask = async (taskId: string, title: string) => {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert([
          {
            task_id: taskId,
            title,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update the task in state to include the new subtask
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, subtasks: [...(task.subtasks || []), data] }
            : task
        )
      );

      toast({
        title: "Success",
        description: "Subtask created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast({
        title: "Error",
        description: "Failed to create subtask",
        variant: "destructive",
      });
    }
  };

  const updateSubtask = async (subtaskId: string, updates: Partial<Subtask>) => {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', subtaskId)
        .select()
        .single();

      if (error) throw error;

      // Update the task in state to reflect the subtask change
      setTasks((prev) =>
        prev.map((task) => ({
          ...task,
          subtasks: task.subtasks?.map((subtask) =>
            subtask.id === subtaskId ? data : subtask
          ) || []
        }))
      );

      return data;
    } catch (error) {
      console.error('Error updating subtask:', error);
      toast({
        title: "Error",
        description: "Failed to update subtask",
        variant: "destructive",
      });
    }
  };

  const deleteSubtask = async (subtaskId: string, taskId: string) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;

      // Update the task in state to remove the subtask
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks?.filter((subtask) => subtask.id !== subtaskId) || []
              }
            : task
        )
      );

      toast({
        title: "Success",
        description: "Subtask deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting subtask:', error);
      toast({
        title: "Error",
        description: "Failed to delete subtask",
        variant: "destructive",
      });
    }
  };

  const createNote = async (taskId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('task_notes')
        .insert([
          {
            task_id: taskId,
            content,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update the task in state to include the new note
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, notes: [...(task.notes || []), data] }
            : task
        )
      );

      toast({
        title: "Success",
        description: "Note added successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const updateNote = async (noteId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('task_notes')
        .update({ content })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      // Update the task in state to reflect the note change
      setTasks((prev) =>
        prev.map((task) => ({
          ...task,
          notes: task.notes?.map((note) =>
            note.id === noteId ? data : note
          ) || []
        }))
      );

      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (noteId: string, taskId: string) => {
    try {
      const { error } = await supabase
        .from('task_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      // Update the task in state to remove the note
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                notes: task.notes?.filter((note) => note.id !== noteId) || []
              }
            : task
        )
      );

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    toggleTask,
    moveTaskToTomorrow,
    moveTaskToLater,
    moveTaskToToday,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    createNote,
    updateNote,
    deleteNote,
  };
}