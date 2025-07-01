# AniSwipe Project Explanation

This document provides a detailed explanation of the AniSwipe project, assuming a background in HTML and CSS but no prior knowledge of React or other related technologies.

## Overview

AniSwipe is a web application that helps users discover new anime by swiping through personalized recommendations. It's like a dating app, but for anime!

The application uses a variety of technologies to provide its functionality, including:

*   **Next.js:** A framework for building web applications with React.
*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A superset of JavaScript that adds static typing.
*   **Supabase:** A platform that provides backend services like authentication, database, and storage.
*   **Jikan API:** An API that provides access to anime data from MyAnimeList.

## Technologies Used

### React

React is a JavaScript library for building user interfaces. It allows you to create reusable components that can be composed together to build complex UIs.

In AniSwipe, React is used to build all of the user interface elements, such as the anime cards, the navigation bar, and the login form.

### Next.js

Next.js is a framework for building web applications with React. It provides features like:

*   **Routing:** Defining different pages and URLs for your application.
*   **Server-side rendering:** Rendering the initial HTML on the server for better performance and SEO.
*   **API routes:** Creating backend endpoints within your Next.js application.
*   **Image optimization:** Optimizing images for different devices and screen sizes.

In AniSwipe, Next.js is used to handle routing, server-side rendering, and API routes.

### TypeScript

TypeScript is a superset of JavaScript that adds static typing. This means that you can define the types of variables, function parameters, and return values. TypeScript helps you catch errors early in the development process and makes your code more maintainable.

In AniSwipe, TypeScript is used to write all of the application code.

### Supabase

Supabase is a platform that provides backend services like authentication, database, and storage. It's like Firebase, but open source.

In AniSwipe, Supabase is used for:

*   **Authentication:** Managing user accounts and sessions.
*   **Database:** Storing anime lists and user preferences.

### Jikan API

The Jikan API is an API that provides access to anime data from MyAnimeList.

In AniSwipe, the Jikan API is used to fetch anime recommendations and display them to the user.

## File Structure

The AniSwipe project has the following file structure:

```
aniswipe/
├── .env.local              # Environment variables (API keys, database URLs, etc.)
├── components/             # Reusable React components
│   ├── add-anime-dialog.tsx
│   ├── anime-search.tsx
│   ├── dynamic-background-image.tsx
│   ├── logout-button.tsx
│   ├── navbar.tsx
│   ├── recommendation-swiper.tsx
│   ├── session-provider.tsx
│   ├── swipe-card.tsx
│   ├── theme-provider.tsx
│   └── user-anime-list.tsx
├── app/                    # Next.js application directory
│   ├── favicon.ico           # Website favicon
│   ├── globals.css           # Global CSS styles
│   ├── layout.tsx            # Root layout for the application
│   ├── page.tsx              # Main page of the application
│   ├── auth/                 # Authentication-related files
│   ├── import-mal/           # Import from MyAnimeList-related files
│   ├── login/                # Login page-related files
│   └── swipe/                # Anime swiping-related files
├── lib/                    # Utility functions and helper modules
│   ├── supabase.ts           # Supabase client initialization
│   └── utils.ts              # Utility functions
├── next.config.js          # Next.js configuration file
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration file
```

### Key Files and Directories

*   `.env.local`: This file stores environment variables, such as API keys and database URLs. These variables are used to configure the application in different environments (e.g., development, production).
*   `components/`: This directory contains reusable React components that are used throughout the application.
*   `app/`: This directory is the main application directory in Next.js. It contains the files that define the different pages and routes of the application.
    *   `layout.tsx`: This file defines the root layout for the application. It includes the navigation bar and any other elements that should be displayed on every page.
    *   `page.tsx`: This file defines the main page of the application.
*   `lib/`: This directory contains utility functions and helper modules that are used throughout the application.
*   `next.config.js`: This file contains the Next.js configuration, such as the image domains and environment variables.
*   `package.json`: This file contains the project's dependencies and scripts.
*   `tsconfig.json`: This file contains the TypeScript configuration.

## Glossary of Terms

*   **API:** An Application Programming Interface (API) is a set of rules and specifications that software programs can follow to communicate with each other.
*   **Component:** A reusable building block for user interfaces in React.
*   **Environment variable:** A variable that is set outside of the application code and used to configure the application in different environments.
*   **Framework:** A collection of tools and libraries that provides a foundation for building applications.
*   **Library:** A collection of reusable code that can be used in different applications.
*   **Module:** A self-contained unit of code that can be imported and used in other modules.
*   **Routing:** The process of defining different pages and URLs for your application.
*   **Server-side rendering:** Rendering the initial HTML on the server for better performance and SEO.
*   **Static typing:** Defining the types of variables, function parameters, and return values.

This explanation should provide you with a good understanding of the AniSwipe project and the technologies used to build it. If you have any further questions, please don't hesitate to ask.