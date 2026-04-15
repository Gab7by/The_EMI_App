import { Tabs } from 'expo-router';
import React from 'react';
import CustomTab from '@/components/tabs/customTab';

export default function TabLayout() {

  return (
    <Tabs
      tabBar={(props) => (<CustomTab {...props} />)}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
      />
      <Tabs.Screen 
        name='podcast'
      />
    </Tabs>
  );
}
