import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { createPost, updatePost } = usePosts();
  const navigate = useNavigate();
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;
    if (!user) return;

    setSaving(true);
    try {
      let post;
      if (currentPostId) {
        post = await updatePost(currentPostId, title || 'Untitled', content, 'draft');
      } else {
        post = await createPost(title || 'Untitled', content, 'draft');
        setCurrentPostId(post.id);
      }
      setLastSaved(new Date());
    } catch (error: any) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [title, content, user, currentPostId, createPost, updatePost]);

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

    await autoSave();
    toast({
      title: 'Success',
      description: 'Draft saved successfully',
    });
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
      if (currentPostId) {
        await updatePost(currentPostId, title, content, 'published');
      } else {
        await createPost(title, content, 'published');
      }
      
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
    if (currentPostId) {
      window.open(`/post/${currentPostId}`, '_blank');
    } else {
      toast({
        title: 'Info',
        description: 'Please save your draft first to preview',
      });
    }
  };

  if (authLoading) {
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
            <h1 className="text-3xl font-bold">Create New Post</h1>
            <div className="flex items-center gap-2">
              {saving && <Badge variant="secondary">Saving...</Badge>}
              {lastSaved && !saving && (
                <Badge variant="outline">
                  Saved {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            Your draft will be auto-saved every 30 seconds
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
              
              {currentPostId && (
                <Button onClick={handlePreview} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              
              <Button onClick={handlePublish} disabled={saving}>
                Publish Post
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