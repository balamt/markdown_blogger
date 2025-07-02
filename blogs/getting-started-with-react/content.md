# Getting Started with React in 2025

React continues to be one of the most popular JavaScript libraries for building user interfaces. In this guide, we'll walk through setting up a modern React application in 2025 with the latest features and best practices.

## Prerequisites

Before we begin, make sure you have the following installed:

- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later) or yarn (v2.0.0 or later)

## Setting Up a New React Project

There are several ways to set up a React project in 2025, but we'll focus on the most popular and efficient methods.

### Using Create React App

Create React App (CRA) remains a simple way to get started with React:

```bash
npx create-react-app my-app
cd my-app
npm start
```

However, for more advanced projects, you might want to consider alternatives like Vite or Next.js.

### Using Vite

Vite has become the preferred tool for many developers due to its speed and efficient build process:

```bash
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
npm run dev
```

### Using Next.js

For applications requiring server-side rendering or static site generation:

```bash
npx create-next-app@latest my-next-app
cd my-next-app
npm run dev
```

## Modern React Features You Should Know

### React Hooks

Hooks have revolutionized how we write React components. Here are some of the most commonly used hooks:

```jsx
import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';

function MyComponent() {
  // State management
  const [count, setCount] = useState(0);
  
  // Side effects
  useEffect(() => {
    document.title = `Count: ${count}`;
    return () => {
      // Cleanup function
    };
  }, [count]);
  
  // Referencing DOM elements
  const buttonRef = useRef(null);
  
  // Performance optimization
  const doubleCount = useMemo(() => {
    return count * 2;
  }, [count]);
  
  // Memoized callback
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Double Count: {doubleCount}</p>
      <button ref={buttonRef} onClick={handleIncrement}>Increment</button>
    </div>
  );
}
```

### React Server Components

React Server Components (RSC) allow you to render components on the server, reducing the JavaScript sent to the client:

```jsx
// Server Component
async function ProductDetails({ id }) {
  const product = await getProduct(id);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton id={product.id} />
    </div>
  );
}

// Client Component
"use client";
function AddToCartButton({ id }) {
  const [added, setAdded] = useState(false);
  
  return (
    <button onClick={() => setAdded(true)}>
      {added ? 'Added to Cart' : 'Add to Cart'}
    </button>
  );
}
```

## State Management in 2025

While Redux has been the go-to state management solution for many years, there are now several alternatives worth considering:

### React Context + useReducer

For many applications, React's built-in Context API with useReducer hook provides sufficient state management:

```jsx
// Create a context
const CounterContext = createContext();

// Create a provider
function CounterProvider({ children }) {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { count: state.count + 1 };
      case 'DECREMENT':
        return { count: state.count - 1 };
      default:
        return state;
    }
  }, { count: 0 });
  
  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  );
}

// Use in components
function Counter() {
  const { state, dispatch } = useContext(CounterContext);
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
    </div>
  );
}
```

### Zustand

Zustand has gained popularity for its simplicity and small bundle size:

```jsx
import create from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Counter() {
  const { count, increment, decrement } = useStore();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

### Jotai

Jotai provides an atomic approach to state management:

```jsx
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>
    </div>
  );
}
```

## Building for Production

To build your React application for production:

```bash
# Create React App
npm run build

# Vite
npm run build

# Next.js
npm run build
```

This will generate optimized files in the `build` or `dist` directory that you can deploy to a web server.

## Conclusion

React continues to evolve with new features and improvements. By following the best practices outlined in this guide, you'll be well on your way to building modern, efficient React applications in 2025.

Happy coding!

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Next.js Documentation](https://nextjs.org/)
