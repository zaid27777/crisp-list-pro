import { useState } from 'react';
import { Check, Clock, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onMoveToTomorrow: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onMoveToTomorrow, onDelete }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggle = async () => {
    setIsCompleting(true);
    await onToggle(task.id, !task.completed);
    setIsCompleting(false);
  };

  const isToday = task.due_date === new Date().toISOString().split('T')[0];
  const isPast = task.due_date < new Date().toISOString().split('T')[0];

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-200 hover:shadow-md border-0",
        "bg-white/60 backdrop-blur-sm",
        task.completed && "opacity-60"
      )}
      style={{ boxShadow: 'var(--shadow-ios-card)' }}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 rounded-full p-0 border-2 transition-all duration-200",
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
          <h3 className={cn(
            "font-medium text-[hsl(var(--ios-text))] truncate",
            task.completed && "line-through text-[hsl(var(--ios-text-secondary))]"
          )}>
            {task.title}
          </h3>
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
            {!task.completed && isToday && (
              <DropdownMenuItem onClick={() => onMoveToTomorrow(task.id)}>
                <Clock className="h-4 w-4 mr-2" />
                Move to Tomorrow
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
    </Card>
  );
}