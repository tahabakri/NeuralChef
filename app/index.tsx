import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the input screen
  return <Redirect href={"/input" as any} />;
} 