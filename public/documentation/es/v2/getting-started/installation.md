---
title: Installation
order: 2
---

## Installation

### Installing Remix-Breeze

1. To create a new Remix-Breeze project, you can use the `create-remix-breeze` CLI:

```shellscript nonumber
npx create-remix-breeze@latest my-breeze-app
```

2. Change directory into your app project:

```shellscript nonumber
cd my-breeze-app
```

3. Setup your `.env` file:

```shellscript nonumber
touch .env
cp -i .env.example .env
```

4. Install the dependencies:

```shellscript nonumber
npm install
```

5. Generate the prisma client:

```shellscript nonumber
npx prisma db push
npx prisma generate
```

6. Run the seed command to seed your database with some initial data:

```shellscript nonumber
npx prisma db seed
```

7. That will create the `user` and `admin` roles in the Role table. And the follwing test user:

- Test User
  - **Email**: `user@test.com`
  - **Password**: `Password@123`

8. Now you should be able to run your dev server with npm run dev and open your app in the browser.

```shellscript nonumber
npx run dev
```

<docs-info>
To see your database tables and interact with them, you can use the prisma studio by running

```shellscript nonumber
npx prisma studio
```

</docs-info>

### What's Next ?

- [Concept Overview](/docs/en/getting-started/concept-overview)
