# Database Setup for SkillSwap Admin Panel

This guide will help you replace the mock data with real dynamic data using Supabase.

## Prerequisites

1. A Supabase account and project
2. The project URL and anon key (already configured in `src/supabaseClient.ts`)

## Database Setup

### 1. Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-setup.sql` into the editor
4. Run the script to create all necessary tables and sample data

### 2. Verify Tables Created

After running the script, you should see these tables in your Supabase dashboard:

- `users` - User profiles and information
- `swap_requests` - Skill swap requests between users
- `feedback` - User feedback and ratings
- `admin_messages` - Platform-wide messages from admins

## What's Changed

### 1. Database Service Layer (`src/services/database.ts`)

- **CRUD Operations**: Complete database operations for all entities
- **Real-time Data**: All data now comes from Supabase instead of localStorage
- **Error Handling**: Proper error handling for database operations
- **Analytics**: Built-in analytics functions for admin dashboard

### 2. Updated Context Providers

#### AppContext (`src/context/AppContext.tsx`)
- **Async Operations**: All operations are now async and connect to the database
- **Loading States**: Added loading indicators for better UX
- **Real-time Updates**: Data refreshes automatically from the database
- **Error Handling**: Proper error handling for failed operations

#### AuthContext (`src/context/AuthContext.tsx`)
- **Database Authentication**: User authentication now uses the database
- **User Registration**: New users are stored in the database
- **Profile Updates**: User profile updates are persisted to the database

### 3. Updated Components

#### AdminDashboard (`src/components/Admin/AdminDashboard.tsx`)
- **Real Analytics**: Dashboard now shows real data from the database
- **Loading States**: Skeleton loading while data is being fetched
- **Dynamic Stats**: All statistics are calculated from live data

#### BrowseSkills (`src/components/Browse/BrowseSkills.tsx`)
- **Async Search**: User search is now async and database-driven
- **Loading Indicators**: Shows loading state while searching
- **Real-time Results**: Search results come from the database

## Key Features

### 1. Real-time Data
- All data is now stored in and retrieved from Supabase
- No more localStorage dependencies
- Data persists across sessions and devices

### 2. Admin Analytics
- **User Statistics**: Real user counts and activity metrics
- **Swap Analytics**: Pending and completed swap statistics
- **Rating System**: Average user ratings from feedback
- **Popular Skills**: Most requested skills across the platform

### 3. User Management
- **User Profiles**: Complete user profiles with skills and availability
- **Rating System**: User ratings based on feedback
- **Activity Tracking**: Track user activity and swap history

### 4. Swap Management
- **Request System**: Complete swap request workflow
- **Status Tracking**: Track swap request status (pending, accepted, completed, etc.)
- **Feedback System**: Users can leave feedback after completed swaps

## Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- name (TEXT)
- email (TEXT, Unique)
- location (TEXT)
- skills_offered (TEXT[])
- skills_wanted (TEXT[])
- availability (TEXT[])
- is_public (BOOLEAN)
- role (TEXT: 'user' | 'admin')
- rating (DECIMAL)
- total_swaps (INTEGER)
- join_date (DATE)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Swap Requests Table
```sql
- id (UUID, Primary Key)
- from_user_id (UUID, Foreign Key)
- to_user_id (UUID, Foreign Key)
- skill_offered (TEXT)
- skill_wanted (TEXT)
- message (TEXT)
- status (TEXT: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Feedback Table
```sql
- id (UUID, Primary Key)
- from_user_id (UUID, Foreign Key)
- to_user_id (UUID, Foreign Key)
- swap_request_id (UUID, Foreign Key)
- rating (INTEGER, 1-5)
- comment (TEXT)
- created_at (TIMESTAMP)
```

### Admin Messages Table
```sql
- id (UUID, Primary Key)
- title (TEXT)
- content (TEXT)
- type (TEXT: 'info' | 'warning' | 'maintenance')
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

## Security Features

### Row Level Security (RLS)
- **User Data Protection**: Users can only see their own data and public profiles
- **Admin Access**: Admins have full access to all data
- **Secure Operations**: All database operations are properly secured

### Authentication
- **User Sessions**: Secure user session management
- **Role-based Access**: Different access levels for users and admins
- **Data Validation**: Input validation and sanitization

## Testing the Setup

### 1. Admin Login
- Use the demo admin account: `admin@skillswap.com` / `admin`
- Verify that the admin dashboard loads with real data

### 2. User Registration
- Register a new user account
- Verify that the user appears in the admin user management

### 3. Create Swap Requests
- Browse skills and create swap requests
- Verify that requests appear in the admin swap management

### 4. Analytics Verification
- Check that the admin dashboard shows real analytics
- Verify that user counts and statistics are accurate

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify your Supabase URL and anon key in `supabaseClient.ts`
   - Check that your Supabase project is active

2. **Permission Errors**
   - Ensure RLS policies are properly set up
   - Check that the database setup script ran successfully

3. **Data Not Loading**
   - Check the browser console for error messages
   - Verify that the database tables exist and have data

### Debug Steps

1. **Check Console Logs**: Look for any error messages in the browser console
2. **Verify Database**: Check your Supabase dashboard to ensure tables exist
3. **Test Connection**: Try a simple query in the Supabase SQL editor
4. **Check RLS**: Ensure Row Level Security policies are active

## Performance Considerations

### 1. Caching
- The app now fetches data from the database on each load
- Consider implementing caching for frequently accessed data

### 2. Real-time Updates
- Consider implementing Supabase real-time subscriptions for live updates
- This would provide instant updates when data changes

### 3. Pagination
- For large datasets, consider implementing pagination
- This would improve performance with many users or swap requests

## Next Steps

### 1. Real-time Features
- Implement Supabase real-time subscriptions
- Add live notifications for new swap requests
- Real-time chat between users

### 2. Advanced Analytics
- Add more detailed analytics and reporting
- Implement data export functionality
- Add charts and graphs to the admin dashboard

### 3. Enhanced Security
- Implement proper password hashing
- Add email verification
- Implement two-factor authentication

### 4. Performance Optimization
- Add database indexes for better query performance
- Implement data caching strategies
- Add pagination for large datasets

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure all database tables are properly set up
4. Check that RLS policies are correctly configured

The admin panel now uses real dynamic data from Supabase, providing a much more robust and scalable solution compared to the previous localStorage-based mock data system. 