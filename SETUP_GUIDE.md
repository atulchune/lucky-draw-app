# Lucky Draw Contest Platform - Setup Guide

## Overview

Lucky Draw Contests is a full-featured web application for creating and managing exciting random position assignment contests. Users can create contests, invite participants, reveal random positions, and select winners.

## Getting Started

### Step 1: Database Setup

Before using the application, you need to set up your Supabase database:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and execute all SQL commands from `DATABASE_SETUP.md` in order:
   - Create Profiles Table
   - Create Contests Table
   - Create Positions Table
   - Create Participants Table
   - Create Profile Trigger

### Step 2: Start the Application

```bash
pnpm dev
```

The application will start at `http://localhost:3000`

### Step 3: Create Account

1. Go to the home page
2. Click "Sign Up"
3. Enter your email and password
4. Confirm your email (check your email inbox)
5. Log in with your credentials

## Using the Application

### Create a Contest

1. **Go to Dashboard** - Click "Create New Contest" button
2. **Fill in Details**:
   - Contest Name (e.g., "Team Event 2026")
   - Description (optional)
   - Team 1 Name (e.g., "Red Team")
   - Team 2 Name (e.g., "Blue Team")
   - Positions per Team (e.g., 5 = 10 total cards)
3. **Submit** - Click "Create Contest"

### Browse and Join Contests

1. **View Contests** - Click "Browse Contests" on dashboard
2. **Choose Contest** - Click "View & Join" on any contest card
3. **Select Team** - Choose Team 1 or Team 2
4. **Join** - Click "Join Contest"

### Reveal and Assign Positions

1. **Open Contest** - From your dashboard or contests list
2. **Reveal Position** - Click on a card with "?"
3. **Receive Position** - A random available position is revealed (e.g., Position 3)
4. **Enter Name** - Type your name in the input field
5. **Save** - Click "Save" to lock in your assignment
6. **Card Closes** - The card now shows as assigned

### Mark Winners (Contest Creator Only)

1. **Open Your Contest** - Go to dashboard → "My Contests"
2. **Find Assigned Card** - Look for cards with assigned names
3. **Mark Winner** - Click:
   - "1st" for 1st place (Gold)
   - "2nd" for 2nd place (Silver)
   - "3rd" for 3rd place (Bronze)
4. **Winners Display** - Winner badges appear on cards

## Key Features

### Dashboard
- View total wins and contest statistics
- See contests you created
- See contests you're participating in
- Quick access to create or browse contests

### Contest Creation
- Unlimited contests
- Customizable team names
- Flexible position counts (1-20 per team)
- Rich descriptions

### Card Reveal System
- Hidden positions (shows "?")
- Click to reveal a random position
- Fair selection - positions can't be assigned twice
- Visual feedback on selection

### Contest Management
- View all participants
- Assign positions to team members
- Mark 1st, 2nd, 3rd place winners
- Close contests when complete

## User Roles

### Contest Participant
- Browse available contests
- Join contests with team selection
- Reveal random positions
- See results
- Track personal wins

### Contest Creator
- Create new contests
- See all participants
- Manually assign positions (if editing)
- Mark winners
- Close contests
- View contest statistics

## Technical Stack

- **Frontend**: Next.js 16 with React 19
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui

## Database Schema

### profiles
- `id` (UUID) - User ID from auth
- `full_name` (TEXT)
- `username` (TEXT) - Unique username
- `avatar_url` (TEXT)
- `total_wins` (INT) - Wins count
- `total_contests` (INT) - Contests joined
- `created_at`, `updated_at` (TIMESTAMP)

### contests
- `id` (UUID) - Unique contest ID
- `creator_id` (UUID) - Contest creator
- `name` (TEXT) - Contest name
- `description` (TEXT)
- `team1_name`, `team2_name` (TEXT)
- `num_positions` (INT) - Positions per team
- `status` (TEXT) - 'open' or 'closed'
- `created_at`, `closed_at`, `updated_at` (TIMESTAMP)

### positions
- `id` (UUID) - Unique position ID
- `contest_id` (UUID) - Contest reference
- `team_name` (TEXT) - Which team
- `position_number` (INT) - Position 1-N
- `assigned_user_id` (UUID) - Who got this position
- `winner_rank` (INT) - 1st/2nd/3rd place
- `created_at` (TIMESTAMP)

### participants
- `id` (UUID) - Unique participant ID
- `contest_id` (UUID) - Contest reference
- `user_id` (UUID) - Participant user
- `team_number` (INT) - Which team they joined
- `assigned_position` (INT) - Their position number
- `created_at` (TIMESTAMP)

## Security

The application uses **Row Level Security (RLS)** policies:

- Users can only see their own profile
- Users can join contests but can't modify other users' data
- Contest creators can manage their contests
- Positions are managed through secure triggers
- All data access is validated on the server

## Troubleshooting

### "Email not confirmed" error
- Check your email inbox for confirmation link
- Click the link to activate your account
- If not received, try signing up again

### "Contest not found"
- Refresh the page
- Make sure contest creator had permission to create it
- Contest may have been deleted

### Card not revealing position
- Ensure all positions for that team haven't been assigned
- Try refreshing the page
- Check contest status is "open"

### Changes not saving
- Check your internet connection
- Verify you're logged in
- Try the action again
- Check browser console for errors

## Support

For issues or questions:
1. Check this guide first
2. Verify database setup is complete
3. Check browser console for error messages
4. Ensure Supabase is properly configured

## Future Enhancements

- Export results as PDF/Excel
- Share contest links with participants
- Invite system with email notifications
- Contest history and analytics
- Custom themes and branding
- Mobile app version
- Real-time collaboration features

---

**Version**: 1.0.0
**Last Updated**: 2026-04-05
