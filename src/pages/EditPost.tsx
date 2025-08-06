import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { Save, Eye, FileText } from 'lucide-react';

export default function EditPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentStatus, setCurrentStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { updatePost, getPost } = usePosts();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const post = await getPost(id);
        if (!post) {
          toast({
            title: 'Error',
            description: 'Post not found',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        if (post.user_id !== user?.id) {
          toast({
            title: 'Error',
            description: 'You do not have permission to edit this post',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        setTitle(post.title);
        setContent(post.content);
        setCurrentStatus(post.status);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load post',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchPost();
    }
  }, [user, id, getPost, navigate]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;
    if (!user || !id) return;

    setSaving(true);
    try {
      await updatePost(id, title || 'Untitled', content, currentStatus);
      setLastSaved(new Date());
    } catch (error: any) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [title, content, currentStatus, user, id, updatePost]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (title.trim() || content.trim()) {
        autoSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSave]);

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for your post',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await updatePost(id!, title, content, 'draft');
      setCurrentStatus('draft');
      setLastSaved(new Date());
      toast({
        title: 'Success',
        description: 'Draft saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save draft',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for your post',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content for your post',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await updatePost(id!, title, content, 'published');
      setCurrentStatus('published');
      toast({
        title: 'Success',
        description: 'Post published successfully!',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish post',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`/post/${id}`, '_blank');
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Edit Post</h1>
            <div className="flex items-center gap-2">
              <Badge variant={currentStatus === 'published' ? 'default' : 'secondary'}>
                {currentStatus}
              </Badge>
              {saving && <Badge variant="secondary">Saving...</Badge>}
              {lastSaved && !saving && (
                <Badge variant="outline">
                  Saved {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            Your changes will be auto-saved every 30 seconds
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Post Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter your post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] resize-y"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button onClick={handleSaveDraft} variant="outline" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              
              <Button onClick={handlePreview} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Button onClick={handlePublish} disabled={saving}>
                {currentStatus === 'published' ? 'Update Published' : 'Publish Post'}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}