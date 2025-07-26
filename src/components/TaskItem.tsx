import { useState } from 'react';
import { Check, Clock, MoreHorizontal, Trash2, Plus, FileText, ChevronDown, ChevronRight, Timer, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Task, Subtask, TaskNote } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onMoveToTomorrow: (id: string) => void;
  onMoveToLater?: (id: string) => void;
  onMoveToToday?: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onDeleteSubtask: (subtaskId: string, taskId: string) => void;
  onCreateNote: (taskId: string, content: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string, taskId: string) => void;
}

export function TaskItem({ 
  task, 
  onToggle, 
  onMoveToTomorrow, 
  onMoveToLater,
  onMoveToToday,
  onDelete,
  onCreateSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onCreateNote,
  onUpdateNote,
  onDeleteNote
}: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  const handleToggle = async () => {
    setIsCompleting(true);
    await onToggle(task.id, !task.completed);
    setIsCompleting(false);
  };

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    
    await onCreateSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setShowSubtaskInput(false);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    
    await onCreateNote(task.id, newNoteContent.trim());
    setNewNoteContent('');
    setShowNoteInput(false);
  };

  const handleEditNote = (note: TaskNote) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteId || !editingNoteContent.trim()) return;
    
    await onUpdateNote(editingNoteId, editingNoteContent.trim());
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const isToday = task.due_date === new Date().toISOString().split('T')[0];
  const isPast = task.due_date < new Date().toISOString().split('T')[0];
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasNotes = task.notes && task.notes.length > 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-200 hover:shadow-md border-0",
        "bg-white/60 backdrop-blur-sm",
        task.completed && "opacity-60"
      )}
      style={{ boxShadow: 'var(--shadow-ios-card)' }}
    >
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 rounded-full p-0 border-2 transition-all duration-200",
            "mt-1 flex-shrink-0",
            task.completed 
              ? "bg-[hsl(var(--ios-blue))] border-[hsl(var(--ios-blue))] text-white" 
              : "border-gray-300 hover:border-[hsl(var(--ios-blue))]"
          )}
          onClick={handleToggle}
          disabled={isCompleting}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {(hasSubtasks || hasNotes) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            <h3 className={cn(
              "font-medium text-[hsl(var(--ios-text))] truncate",
              task.completed && "line-through text-[hsl(var(--ios-text-secondary))]"
            )}>
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className="text-sm text-[hsl(var(--ios-text-secondary))] mt-1 truncate">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {isPast && !task.completed && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                Overdue
              </span>
            )}
            {isToday && !task.completed && (
              <span className="text-xs bg-[hsl(var(--ios-blue))]/10 text-[hsl(var(--ios-blue))] px-2 py-1 rounded-full">
                Today
              </span>
            )}
            {hasSubtasks && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {completedSubtasks}/{totalSubtasks} subtasks
              </span>
            )}
            {hasNotes && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {task.notes?.length} notes
              </span>
            )}
            <span className="text-xs text-[hsl(var(--ios-text-secondary))]">
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setShowSubtaskInput(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subtask
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowNoteInput(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Add Note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!task.completed && (task.status === 'today') && (
              <>
                <DropdownMenuItem onClick={() => onMoveToTomorrow(task.id)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Move to Tomorrow
                </DropdownMenuItem>
                {onMoveToLater && (
                  <DropdownMenuItem onClick={() => onMoveToLater(task.id)}>
                    <Timer className="h-4 w-4 mr-2" />
                    Do It Later
                  </DropdownMenuItem>
                )}
              </>
            )}
            {!task.completed && (task.status === 'later') && onMoveToToday && (
              <DropdownMenuItem onClick={() => onMoveToToday(task.id)}>
                <Calendar className="h-4 w-4 mr-2" />
                Move to Today
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 pl-9 space-y-3">
          {/* Subtasks */}
          {hasSubtasks && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[hsl(var(--ios-text))]">Subtasks</h4>
              {task.subtasks?.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 p-2 bg-white/40 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-4 w-4 rounded-full p-0 border transition-all duration-200",
                      subtask.completed 
                        ? "bg-[hsl(var(--ios-blue))] border-[hsl(var(--ios-blue))] text-white" 
                        : "border-gray-300 hover:border-[hsl(var(--ios-blue))]"
                    )}
                    onClick={() => onToggleSubtask(subtask.id, !subtask.completed)}
                  >
                    {subtask.completed && <Check className="h-2 w-2" />}
                  </Button>
                  <span className={cn(
                    "flex-1 text-sm",
                    subtask.completed && "line-through text-[hsl(var(--ios-text-secondary))]"
                  )}>
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={() => onDeleteSubtask(subtask.id, task.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {hasNotes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[hsl(var(--ios-text))]">Notes</h4>
              {task.notes?.map((note) => (
                <div key={note.id} className="p-3 bg-white/40 rounded-lg">
                  {editingNoteId === note.id ? (
                    <form onSubmit={handleUpdateNote} className="space-y-2">
                      <Textarea
                        value={editingNoteContent}
                        onChange={(e) => setEditingNoteContent(e.target.value)}
                        className="text-sm resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="h-7 text-xs">
                          Save
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={cancelEditNote}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm text-[hsl(var(--ios-text))] whitespace-pre-wrap flex-1">
                        {note.content}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                          onClick={() => handleEditNote(note)}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => onDeleteNote(note.id, task.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-[hsl(var(--ios-text-secondary))] mt-2">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add subtask input */}
      {showSubtaskInput && (
        <div className="mt-4 pl-9">
          <form onSubmit={handleCreateSubtask} className="space-y-2">
            <Input
              placeholder="Enter subtask title..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="h-7 text-xs">
                Add Subtask
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs" 
                onClick={() => {
                  setShowSubtaskInput(false);
                  setNewSubtaskTitle('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Add note input */}
      {showNoteInput && (
        <div className="mt-4 pl-9">
          <form onSubmit={handleCreateNote} className="space-y-2">
            <Textarea
              placeholder="Enter your note..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="text-sm resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="h-7 text-xs">
                Add Note
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs" 
                onClick={() => {
                  setShowNoteInput(false);
                  setNewNoteContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}