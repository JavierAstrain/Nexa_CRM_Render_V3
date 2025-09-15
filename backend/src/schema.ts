import gql from "graphql-tag";

export const typeDefs = gql`#graphql
  scalar JSON
  enum Stage { PROSPECT QUALIFIED PROPOSAL NEGOTIATION WON LOST }
  enum ActivityType { TASK CALL MEETING NOTE }
  enum Role { ADMIN MANAGER USER }

  type User {
    id: ID!
    email: String!
    name: String
    role: Role!
    viewFinancials: Boolean!
    createdAt: String!
  }

  type Account {
    id: ID!
    name: String!
    website: String
    phone: String
    owner: User
    contacts: [Contact!]!
    opps: [Opportunity!]!
    createdAt: String!
  }

  type Contact {
    id: ID!
    firstName: String!
    lastName: String!
    email: String
    phone: String
    title: String
    account: Account
    activities: [Activity!]!
    createdAt: String!
  }

  type Opportunity {
    id: ID!
    name: String!
    amount: Float
    probability: Int
    stage: Stage!
    closeDate: String
    account: Account
    contact: Contact
    owner: User
    activities: [Activity!]!
    quotes: [Quote!]!
    score: Int
    createdAt: String!
  }

  type Activity {
    id: ID!
    type: ActivityType!
    subject: String!
    dueDate: String
    notes: String
    contact: Contact
    opportunity: Opportunity
    createdAt: String!
  }

  type EmailThread {
    id: ID!
    subject: String!
    participants: [String!]!
    preview: String
    messages: JSON!
    account: Account
    contact: Contact
    createdAt: String!
  }

  type Product {
    id: ID!
    name: String!
    sku: String!
    basePrice: Float!
    active: Boolean!
  }

  type PriceList {
    id: ID!
    name: String!
    currency: String!
    items: [PriceListItem!]!
  }

  type PriceListItem {
    id: ID!
    product: Product!
    price: Float!
  }

  type Quote {
    id: ID!
    title: String!
    currency: String!
    status: String!
    total: Float!
    lines: [QuoteLine!]!
  }

  type QuoteLine {
    id: ID!
    product: Product!
    qty: Int!
    unitPrice: Float!
    lineTotal: Float!
  }

  type FunnelMetric { stage: Stage!, count: Int! }
  type Analytics {
    funnel: [FunnelMetric!]!
    winRate: Float!
    salesVelocityDays: Float!
  }

  type RagResult {
    answer: String!
    context: [String!]!
  }

  type CopilotSuggestion {
    title: String!
    detail: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input OpportunityInput {
    name: String!
    amount: Float
    probability: Int
    stage: Stage
    closeDate: String
    accountId: ID
    contactId: ID
    ownerId: ID
  }

  input QuoteLineInput {
    productId: ID!
    qty: Int!
    unitPrice: Float!
  }

  type Query {
    me: User
    accounts(search: String): [Account!]!
    contacts(search: String): [Contact!]!
    opportunities(search: String, stage: Stage): [Opportunity!]!
    activities(opportunityId: ID, contactId: ID): [Activity!]!
    emailThreads(accountId: ID, contactId: ID): [EmailThread!]!
    products(search: String): [Product!]!
    priceLists: [PriceList!]!
    quotes(opportunityId: ID): [Quote!]!
    analytics: Analytics!
    rag(query: String!): RagResult!
    copilot(entityType: String!, entityId: ID!): [CopilotSuggestion!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String): AuthPayload!

    createAccount(name: String!, website: String, phone: String): Account!
    createContact(firstName: String!, lastName: String!, email: String, accountId: ID): Contact!
    createOpportunity(input: OpportunityInput!): Opportunity!
    updateOpportunity(id: ID!, input: OpportunityInput!): Opportunity!
    setOpportunityStage(id: ID!, stage: Stage!): Opportunity!
    addActivity(opportunityId: ID, contactId: ID, type: ActivityType!, subject: String!, notes: String, dueDate: String): Activity!

    createQuote(opportunityId: ID!, title: String!, currency: String!, lines: [QuoteLineInput!]!): Quote!
    updateQuote(id: ID!, title: String, status: String, lines: [QuoteLineInput!]): Quote!

    simulateCalendarSync: String!
    simulateEmailSync: String!

    createWorkflow(name: String!, definition: JSON!): String!
  }
`;
