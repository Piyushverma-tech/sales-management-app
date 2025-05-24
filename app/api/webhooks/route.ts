import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

import User from '@/app/Models/UserSchema';
import Organization from '@/app/Models/OrganizationSchema';
import SalesPerson from '@/app/Models/SalesPersonSchema';
import connect from '@/app/lib/connect';

// Ensure this runs as a dynamic server function and is not cached
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification error', {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data;
  const eventType = evt.type;

  await connect();

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data;

    const newUser = {
      clerkUserId: id,
      emailAddress: email_addresses[0].email_address,
    };
    
    try {
      await User.create(newUser);
      console.log('User created');
    } catch (error) {
      console.error('Error while creating user:', error);
    }
  }

  // Handle organization events
  if (eventType === 'organization.created') {
    const { id, name, created_by } = evt.data;
    
    try {
      await Organization.create({
        clerkOrganizationId: id,
        name,
        createdByUserId: created_by,
      });
      console.log('Organization created');
    } catch (error) {
      console.error('Error while creating organization:', error);
    }
  }

  // Handle organization member events
  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data;
    
    try {
      const existingSalesPerson = await SalesPerson.findOne({
        clerkUserId: public_user_data.user_id,
        organizationId: organization.id
      });
      
      if (!existingSalesPerson) {
        await SalesPerson.create({
          clerkUserId: public_user_data.user_id,
          organizationId: organization.id,
          name: public_user_data.first_name 
            ? `${public_user_data.first_name} ${public_user_data.last_name || ''}`
            : public_user_data.identifier
        });
        console.log('Sales person created from organization membership');
      }
    } catch (error) {
      console.error('Error while creating sales person from membership:', error);
    }
  }

  // Handle member removal
  if (eventType === 'organizationMembership.deleted') {
    const { organization, public_user_data } = evt.data;
    
    try {
      console.log('Processing organization membership deletion:', {
        userId: public_user_data?.user_id,
        orgId: organization?.id,
        identifier: public_user_data?.identifier
      });
      
      // Validate required data
      if (!public_user_data?.user_id || !organization?.id) {
        console.error('Missing required data for membership deletion:', evt.data);
        return new Response('Error: Missing required data for membership deletion', { 
          status: 400 
        });
      }
      
      // First check if the sales person exists
      const existingSalesPerson = await SalesPerson.findOne({
        clerkUserId: public_user_data.user_id,
        organizationId: organization.id
      });
      
      if (!existingSalesPerson) {
        console.log('Sales person not found for deletion. Possibly already deleted.', {
          userId: public_user_data.user_id,
          orgId: organization.id
        });
      } else {
        // Delete the sales person
        const result = await SalesPerson.findOneAndDelete({
          clerkUserId: public_user_data.user_id,
          organizationId: organization.id
        });
        
        if (result) {
          console.log('Sales person successfully removed:', {
            id: result._id,
            name: result.name,
            userId: result.clerkUserId,
            orgId: result.organizationId
          });
        } else {
          console.error('Failed to remove sales person. Delete operation returned null.');
        }
      }
    } catch (error) {
      console.error('Error while removing sales person:', error);
      // Continue processing to return 200 status - we don't want Clerk to retry
      // as this could be a temporary database issue
    }
  }

  console.log(`Webhook processed successfully. ID: ${id}, Type: ${eventType}`);
  // Only log a short excerpt of the body to avoid cluttering logs
  console.log('Webhook payload excerpt:', body.substring(0, 200) + (body.length > 200 ? '...' : ''));

  return new Response('Webhook received', { status: 200 });
}
