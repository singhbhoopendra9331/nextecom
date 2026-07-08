import {
  GalleryVerticalEnd,
  Users,
  Image,
  FileText,
  LayoutDashboard,
  FolderTree,
  Settings,
  ShoppingCart,
  ScrollText,
} from "lucide-react";

export const data = {
  user: {
    name: "user",
    email: "user@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },

  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],

  navMain: [
    // 📊 Dashboard
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },

    // 🛒 Ecommerce
    {
      title: "Ecommerce",
      url: "#",
      icon: ShoppingCart,
      items: [
        {
          title: "Products",
          url: "/admin/products",
        },
        {
          title: "Categories",
          url: "/admin/categories",
        },
        {
          title: "Orders",
          url: "/admin/orders",
        },
        {
          title: "Customers",
          url: "/admin/customers",
        },
        {
          title: "Coupons",
          url: "/admin/coupons",
        },
      ],
    },

    // 📝 CMS
    {
      title: "CMS",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Pages",
          url: "/admin/pages",
        },
        {
          title: "Posts",
          url: "/admin/posts",
        },
        {
          title: "Forms",
          url: "/admin/forms",
        },
        {
          title: "Media Library",
          url: "/admin/media",
        },
      ],
    },

    // 👥 Users
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },

    // 🖼 Media
    {
      title: "Media",
      url: "/admin/media",
      icon: Image,
    },

    // 🏷 Catalog
    {
      title: "Catalog",
      url: "#",
      icon: FolderTree,
      items: [
        {
          title: "Tags",
          url: "/admin/tags",
        },
        {
          title: "Attributes",
          url: "/admin/attributes",
        },
      ],
    },

    // ⚙ Settings
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },

    // 📋 Logs
    {
      title: "Logs",
      url: "/admin/logs",
      icon: ScrollText,
    },

    {
      title: "Global Settings",
      url: "/admin/",
      icon: Settings,
      items: [
        {
          title: "Header",
          url: "/admin/settings/header",
        },
        {
          title: "Footer",
          url: "/admin/settings/footer",
        }, 
      ],
    }
  ],
};