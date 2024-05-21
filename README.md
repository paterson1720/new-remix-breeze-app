# Getting Started

### Create a new Remix-Breeze App

Crate a new Remix-Breeze app using the `create-remix-breeze` cli, make sure you replace <YOUR_APP_NAME> with the name of your app.

```bash
npx create-remix-breeze@latest <YOUR_APP_NAME>
cd <YOUR_APP_NAME>
```

### Intall the dependencies

```bash
npm install
```

### Setup Prisma

You need to to run these commands to create the tables in your database and create the prisma client.

```bash
npx prisma db push
npx prima generate
```

### Seed the database

Run the following command to seed your database to add some initial data. That will add the `user` and `admin` role to your `Role` table and create a test user.

```bash
npx prisma db seed
```

### Run your development server

```bash
npm run dev
```

### Login to your app

To login you can either register a new user by visiting the `/auth/register`
or use the following test using that was created with the db seed command.

- **Email**: test@user.com
- **Password**: Password@123

## Using the CLI

Remix-Breeze come with a handy CLI that allows you to quickly scaffold CRUD ressources.

### Quickly Scaffold a Blog

To try out the Remix-Breeze CLI, let's create a blog.

With a single `@remix-breeze/cli g-crud` command, you can scaffold a fully featured blog where you can create, read, update and delete posts, including Backend and Frontend code.

Run this command in your CLI

```bash
npx @remix-breeze/cli g-crud -r posts -m "title:string content:text isPublished:boolean"
```

**Note**: For the first time it might prompt you to install the CLI. Type "y" to accept.

After the command executed successfully, you'll get an overview of all the files that were created in the project the the model `Post` will be added to the `prisma/prisma.schema` file.

### Regenerate the Prisma client

Run the following commands to regenerate the prisma client and create the Post table:

```bash
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