import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  published_at?: string;
  user_id: string;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as Post[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishedPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as Post[]);
    } catch (error) {
      console.error('Error fetching published posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (title: string, content: string, status: 'draft' | 'published' = 'draft') => {
    if (!user) throw new Error('User not authenticated');

    const postData = {
      title,
      content,
      status,
      user_id: user.id,
      ...(status === 'published' && { published_at: new Date().toISOString() })
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updatePost = async (id: string, title: string, content: string, status: 'draft' | 'published') => {
    if (!user) throw new Error('User not authenticated');

    const updateData = {
      title,
      content,
      status,
      ...(status === 'published' && { published_at: new Date().toISOString() })
    };

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deletePost = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const getPost = async (id: string): Promise<Post | null> => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }
    return data as Post;
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  return {
    posts,
    loading,
    fetchPosts,
    fetchPublishedPosts,
    createPost,
    updatePost,
    deletePost,
    getPost,
  };
}