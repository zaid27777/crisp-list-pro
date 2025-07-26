import { useState, useEffect } from 'react';
import { Calendar, History, LogOut, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { TaskItem } from '@/components/TaskItem';
import { AddTaskForm } from '@/components/AddTaskForm';

export default function TodoApp() {
  const { user, signOut } = useAuth();
  const { 
    tasks, 
    loading, 
    createTask, 
    toggleTask, 
    moveTaskToLater,
    moveTaskToToday,
    deleteTask, 
    fetchTasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    createNote,
    updateNote,
    deleteNote
  } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const todayTasks = tasks.filter(task => 
    task.status === 'today' && !task.completed
  );

  const laterTasks = tasks.filter(task => 
    task.status === 'later' && !task.completed
  );

  const completedTasks = tasks.filter(task => task.completed);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchTasks(date);
  };

  const handleAddTask = async (title: string, description?: string) => {
    await createTask(title, description, selectedDate);
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    await updateSubtask(subtaskId, { completed });
  };

  const handleCreateSubtask = async (taskId: string, title: string) => {
    await createSubtask(taskId, title);
  };

  const handleCreateNote = async (taskId: string, content: string) => {
    await createNote(taskId, content);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[hsl(var(--ios-blue))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[hsl(var(--ios-text-secondary))]">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ background: 'var(--gradient-subtle)' }}>
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm" style={{ boxShadow: 'var(--shadow-ios)' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[hsl(var(--ios-blue))] rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-[hsl(var(--ios-text))]">
                    To-Do List
                  </h1>
                  <p className="text-sm text-[hsl(var(--ios-text-secondary))]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-[hsl(var(--ios-text-secondary))]"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="today" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm rounded-xl">
            <TabsTrigger value="today" className="data-[state=active]:bg-[hsl(var(--ios-blue))] data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-1" />
              Today
            </TabsTrigger>
            <TabsTrigger value="later" className="data-[state=active]:bg-[hsl(var(--ios-blue))] data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-1" />
              Later
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[hsl(var(--ios-blue))] data-[state=active]:text-white">
              <History className="h-4 w-4 mr-1" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <AddTaskForm onAddTask={handleAddTask} />
            
            <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <Card className="border-0 bg-white/60 backdrop-blur-sm" style={{ boxShadow: 'var(--shadow-ios-card)' }}>
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-[hsl(var(--ios-text-secondary))]" />
                    <p className="text-[hsl(var(--ios-text-secondary))]">No tasks for today</p>
                    <p className="text-sm text-[hsl(var(--ios-text-secondary))] mt-1">Add a task to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                todayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onMoveToLater={moveTaskToLater}
                    onDelete={deleteTask}
                    onCreateSubtask={handleCreateSubtask}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteSubtask={deleteSubtask}
                    onCreateNote={handleCreateNote}
                    onUpdateNote={updateNote}
                    onDeleteNote={deleteNote}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="later" className="space-y-4">
            <div className="space-y-3">
              {laterTasks.length === 0 ? (
                <Card className="border-0 bg-white/60 backdrop-blur-sm" style={{ boxShadow: 'var(--shadow-ios-card)' }}>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-[hsl(var(--ios-text-secondary))]" />
                    <p className="text-[hsl(var(--ios-text-secondary))]">No tasks for later</p>
                    <p className="text-sm text-[hsl(var(--ios-text-secondary))] mt-1">Move tasks here when you want to do them later!</p>
                  </CardContent>
                </Card>
              ) : (
                laterTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onMoveToLater={moveTaskToLater}
                    onMoveToToday={moveTaskToToday}
                    onDelete={deleteTask}
                    onCreateSubtask={handleCreateSubtask}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteSubtask={deleteSubtask}
                    onCreateNote={handleCreateNote}
                    onUpdateNote={updateNote}
                    onDeleteNote={deleteNote}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="border-0 bg-white/60 backdrop-blur-sm" style={{ boxShadow: 'var(--shadow-ios-card)' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[hsl(var(--ios-text))]">Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedTasks.length === 0 ? (
                  <div className="text-center py-6">
                    <History className="h-12 w-12 mx-auto mb-3 text-[hsl(var(--ios-text-secondary))]" />
                    <p className="text-[hsl(var(--ios-text-secondary))]">No completed tasks yet</p>
                    <p className="text-sm text-[hsl(var(--ios-text-secondary))] mt-1">Complete some tasks to see them here!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {completedTasks
                      .sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime())
                      .map((task) => (
                        <div key={task.id} className="p-3 rounded-xl bg-white/40 border border-gray-100">
                          <h3 className="font-medium text-[hsl(var(--ios-text))] line-through">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-[hsl(var(--ios-text-secondary))] mt-1">
                              {task.description}
                            </p>
                          )}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-[hsl(var(--ios-text-secondary))]">
                                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks completed
                              </p>
                            </div>
                          )}
                          {task.notes && task.notes.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs text-[hsl(var(--ios-text-secondary))]">
                                {task.notes.length} note{task.notes.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              ✓ Completed
                            </span>
                            <span className="text-xs text-[hsl(var(--ios-text-secondary))]">
                              {task.completed_at && new Date(task.completed_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <div className="text-center mt-8 pb-4">
          <p className="text-xs text-[hsl(var(--ios-text-secondary))]">
            developed by{' '}
            <a 
              href="https://inamdarconsultancy.com/apps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[hsl(var(--ios-blue))] hover:underline"
            >
              inamdarconsultancy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}