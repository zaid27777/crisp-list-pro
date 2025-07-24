import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface AddTaskFormProps {
  onAddTask: (title: string, description?: string) => Promise<void>;
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onAddTask(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-xl bg-[hsl(var(--ios-blue))] hover:bg-[hsl(var(--ios-blue-light))] text-white font-medium h-12"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add New Task
      </Button>
    );
  }

  return (
    <Card className="border-0 bg-white/60 backdrop-blur-sm" style={{ boxShadow: 'var(--shadow-ios-card)' }}>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border-0 bg-white/80"
            autoFocus
            disabled={loading}
          />
          <Textarea
            placeholder="Add a description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border-0 bg-white/80 resize-none min-h-[80px]"
            disabled={loading}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!title.trim() || loading}
              className="flex-1 rounded-xl bg-[hsl(var(--ios-blue))] hover:bg-[hsl(var(--ios-blue-light))] text-white"
            >
              {loading ? 'Adding...' : 'Add Task'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setTitle('');
                setDescription('');
              }}
              className="px-4 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}