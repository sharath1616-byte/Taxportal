// Mock data for tax and accounting client portal

export const customerLogos = [
  {
    id: 1,
    name: "TaxPro Solutions",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=60&fit=crop&crop=center"
  },
  {
    id: 2,
    name: "Accounting Plus",
    logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&h=60&fit=crop&crop=center"
  },
  {
    id: 3,
    name: "Financial Advisors Group",
    logo: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=120&h=60&fit=crop&crop=center"
  },
  {
    id: 4,
    name: "CPA Partners",
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=60&fit=crop&crop=center"
  },
  {
    id: 5,
    name: "BookKeeping Pro",
    logo: "https://images.unsplash.com/photo-1599658880436-c61792e70672?w=120&h=60&fit=crop&crop=center"
  }
];

export const industryShowcase = [
  {
    id: 1,
    title: "Tax Preparation",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop",
    link: "/solutions/tax-preparation"
  },
  {
    id: 2,
    title: "Bookkeeping",
    image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=400&h=300&fit=crop",
    link: "/solutions/bookkeeping"
  },
  {
    id: 3,
    title: "Financial Advisory", 
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop",
    link: "/solutions/financial-advisory"
  },
  {
    id: 4,
    title: "Payroll Services",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop",
    link: "/solutions/payroll"
  },
  {
    id: 5,
    title: "Business Consulting",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    link: "/solutions/consulting"
  },
  {
    id: 6,
    title: "Audit Services",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    link: "/solutions/audit"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Owner, Johnson Tax Services",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
    quote: "My clients love the platform, and I love using it. The first step of working together feels effortless, and that creates a powerful first impression.",
    company: "Johnson Tax Services"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Founder, Chen Accounting",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    quote: "TaxPortal saves us from coding a whole portal solution. We implemented a secure client portal quickly for our tax and accounting practice.",
    company: "Chen Accounting"
  }
];

export const navigationMenu = {
  products: {
    "You get": [
      {
        icon: "Users",
        title: "Client Portal",
        description: "Deliver a branded client experience",
        link: "/client-portal"
      },
      {
        icon: "Settings",
        title: "Client management",
        description: "CRM and billing tools",
        link: "/client-management"
      },
      {
        icon: "Layers",
        title: "An extendable platform",
        description: "Integrate with any software",
        link: "/platform"
      }
    ],
    "You can": [
      { title: "Automate client onboarding", link: "/client-onboarding" },
      { title: "Sign and send contracts", link: "/esignature" },
      { title: "Sell tax packages", link: "/store" },
      { title: "Invoice and get paid", link: "/invoicing" },
      { title: "Share secure files", link: "/file-sharing" },
      { title: "Improve client communication", link: "/communication" }
    ]
  },
  solutions: {
    "Industries": [
      {
        icon: "Calculator",
        title: "Tax Preparation",
        link: "/solutions/tax-preparation"
      },
      {
        icon: "BookOpen",
        title: "Bookkeeping Services",
        link: "/solutions/bookkeeping"
      },
      {
        icon: "TrendingUp",
        title: "Financial Advisory",
        link: "/solutions/financial-advisory"
      },
      {
        icon: "Users",
        title: "Payroll Services",
        link: "/solutions/payroll"
      },
      {
        icon: "Building",
        title: "Business Consulting",
        link: "/solutions/consulting"
      },
      {
        icon: "FileCheck",
        title: "Audit Services",
        link: "/solutions/audit"
      }
    ]
  },
  resources: [
    {
      icon: "FileText",
      title: "Blog",
      link: "/blog"
    },
    {
      icon: "BookOpen",
      title: "Help Guides",
      link: "/help"
    },
    {
      icon: "Bell",
      title: "What's New",
      link: "/updates"
    },
    {
      icon: "Search",
      title: "Find an Expert",
      link: "/experts"
    },
    {
      icon: "Shield",
      title: "Security",
      link: "/security"
    }
  ]
};

export const features = [
  {
    id: 1,
    title: "AI Assistant",
    description: "Your copilot for smarter client interactions.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    link: "/ai-assistant"
  },
  {
    id: 2,
    title: "Security",
    description: "Enterprise-grade protection built in from day one.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop",
    link: "/security"
  },
  {
    id: 3,
    title: "Contracts & eSignatures",
    description: "Streamline document signatures in one place.",
    link: "/esignature"
  },
  {
    id: 4,
    title: "Tax Package Storefronts",
    description: "Sell your tax services with eCommerce-style packages.",
    link: "/store"
  },
  {
    id: 5,
    title: "Invoicing & Billing",
    description: "Send invoices and create subscriptions with 1-click payments.",
    link: "/invoicing"
  }
];

export const integrationLogos = [
  {
    name: "QuickBooks",
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=50&fit=crop"
  },
  {
    name: "Xero",
    logo: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=100&h=50&fit=crop"
  },
  {
    name: "TaxWise",
    logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&h=50&fit=crop"
  },
  {
    name: "Drake Software",
    logo: "https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=100&h=50&fit=crop"
  },
  {
    name: "ProSeries",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=50&fit=crop"
  }
];