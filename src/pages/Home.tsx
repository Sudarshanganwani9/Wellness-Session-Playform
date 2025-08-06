import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { posts, loading: postsLoading, fetchPosts, fetchPublishedPosts, deletePost } = usePosts();
  const [activeTab, setActiveTab] = useState('my-posts');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (activeTab === 'my-posts' && user) {
      fetchPosts();
    } else if (activeTab === 'published') {
      fetchPublishedPosts();
    }
  }, [activeTab, user]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        toast({
          title: 'Success',
          description: 'Post deleted successfully',
        });
        fetchPosts();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete post',
          variant: 'destructive',
        });
      }
    }
  };

  if (authLoading || postsLoading) {
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blog Dashboard</h1>
          <p className="text-muted-foreground">Manage your blog posts and view published content</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="published">Published Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="my-posts" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-4">No posts yet. Create your first post!</p>
                  <Link to="/create">
                    <Button>Create New Post</Button>
                  </Link>
                </div>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {post.status === 'published' && post.published_at
                          ? `Published ${new Date(post.published_at).toLocaleDateString()}`
                          : `Updated ${new Date(post.updated_at).toLocaleDateString()}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.content.substring(0, 120)}...
                      </p>
                      <div className="flex gap-2">
                        <Link to={`/edit/${post.id}`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/post/${post.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="published" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No published posts yet.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      <CardDescription>
                        Published {new Date(post.published_at!).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.content.substring(0, 120)}...
                      </p>
                      <Link to={`/post/${post.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          Read More
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}