---
title: Building your app
order: 5
---

## Building Your App

### introduction

After installing Remix-Breeze, you may wonder how to actually start building your application. Thankfully, since Remix-Breeze handles the configuration of all of the initial authentication and application scaffolding, you can get started right away!

After installing Remix-Breeze, the code is yours. The templates belong to your application and can be modified as you see fit. Remix-Breeze is just a starting point. You do not need to worry about keeping your user interface "compatible" with future Remix-Breeze releases because each Remix-Breeze release is simply an entirely new iteration of the stack. In other words, Remix-Breeze is not a package or administration dashboard that you will "update" in the future. It is a starter kit scaffolding for Remix and, after it is installed, the templates are entirely yours to maintain.

### Application Dashboard ​

After authenticating with your application, you will be redirected to the `/dashboard` route. This route is the home `/dashboard` screen of your application. This page is rendered by the `pages/dashboard/index.tsx` file.

Once you have familiarized yourself with the dashboard and application layout templates, feel free to start editing them. For example, you will probably want to remove the "welcome" component that is rendered on your application dashboard. To do so, you may delete it from your Dashboard component exported in the `pages/dashboard/index.tsx` file. Next, you're free to write the `loader` function needed to build your application dashboard. Remember, Remix-Breeze uses the powerful Tailwind CSS framework, so be sure to learn more about Tailwind by consulting the Tailwind documentation.

### Adding Additional Pages ​

By default, Remix-Breeze's top navigation menu includes a link to the application dashboard. Of course, you are free to edit this navigation menu to add links to other pages that will be available within your application. The navigation menu is defined by the `pages/_layout/app-layout.tsx` file.

Remix-Breeze uses the `@remix-breeze/auth` package, created by the same creator of Remix-Breeze. You may want to read the [Remix-Breeze Auth documentation](https://www.npmjs.com/package/@remix-breeze/auth?activeTab=readme) to get familiar with it. Either way, there is plenty of example on how to protect pages, redirect when authenticated or not and more in the Remix-Breeze codebase that you can take as reference.

### User Profile ​

When building a Remix-Breeze application, it's likely that you will need to add your own forms and panels to the user profile management screen. You can access the user profile, by clicking on the user name at the top right corner and click "Account".

By default, the user's profile page contains sections to update the user's information, like first name, last name, update their password, and delete their account. However, you're free to add your own additional sections to this page. To do so, you may simply edit the files that define the page in `pages/account`.
