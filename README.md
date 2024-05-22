# Quick Start

### Create a new Remix-Breeze App

Crate a new Remix-Breeze app using the `create-remix-breeze` cli, make sure you replace <YOUR_APP_NAME> with the name of your app.

```shellscript
npx create-remix-breeze@latest <YOUR_APP_NAME>
```

By running the `create-remix-breeze@latest` cli the following will happen automatically:

- Initializes a new Remix-Breeze app
- Installs the dependencies
- Creates a `.env` file with the initial variables
- Initializes an empty git repository
- Setups prisma with a dev SQLite database
- Creates a test userin the database

**Note**: You can use prisma studio to interact with your database by running `npx prisma studio` and navigate to the link displayed in your terminal.

### Run your development server

Change directory into your newly created app and run the dev server

```shellscript
cd <YOUR_APP_NAME>
npm run dev
```

### Login to your app

To login you can either register a new user by visiting the `/auth/register`
or use the following test user that was created with the db seed command.

- **Email**: test@user.com
- **Password**: Password@123

## Using the CLI

Remix-Breeze come with a handy CLI that allows you to quickly scaffold CRUD ressources.

### Let's Quickly Scaffold a Blog

To try out the Remix-Breeze CLI, let's create a blog.

With a single `@remix-breeze/cli g-crud` command, you can scaffold a fully featured blog where you can create, read, update and delete posts, including Backend and Frontend code.

Run this command in your CLI

```shellscript
npx @remix-breeze/cli g-crud -r posts -m "title:string content:text isPublished:boolean"
```

**Note**: For the first time it might prompt you to install the CLI. Type "y" to accept.

After the command executed successfully, you'll get an overview of all the files that were created in the project and the model `Post` will be added to the `prisma/prisma.schema` file.

### Regenerate the Prisma client

Run the following commands to regenerate the prisma client and automatically create the `Post` table in the database:

```shellscript
npx prisma db push
npx prima generate
```

### Test your blog

Stop and restart the development server. and navigate to the `/posts` route and see the magic happen.

You can create, view, edit and delete posts.

You can find the pages code in the `pages/posts` diretory, where you can style your blog as you wish and ship your blog.

What's Next ?

- [Read the documentation](https://remixbreeze.com/docs)
- [Join our Discord community](https://discord.gg/W7774VAbSM)
- [Follow the creator on Twitter](https://x.com/Paterson1720)
