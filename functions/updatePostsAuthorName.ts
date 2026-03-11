import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { newName } = await req.json();

        if (!newName) {
            return Response.json({ error: 'New name is required' }, { status: 400 });
        }

        // Get all posts by this user
        const posts = await base44.entities.CommunityPost.filter({
            created_by: user.email
        });

        // Update each post with the new author name
        const updatePromises = posts.map(post => 
            base44.entities.CommunityPost.update(post.id, {
                author_name: newName
            })
        );

        await Promise.all(updatePromises);

        return Response.json({ 
            success: true, 
            updatedCount: posts.length 
        });
    } catch (error) {
        console.error('Error updating posts:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});