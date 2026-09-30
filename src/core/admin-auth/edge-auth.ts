import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import './types';

// Middleware-only instance: decodes the same session cookie without loading the SharePoint-backed
// password provider. Never use it for signIn — that lives in auth.ts.
export const { auth: edgeAuth } = NextAuth(authConfig);
