import axios from 'axios';

import { notificationOptions } from '../../config';

export async function publishNotification(message: PublishMessage) {
  if (!notificationOptions.enabled) return;

  const instance = notificationOptions.instance || 'https://ntfy.sh/';
  const topic = notificationOptions.topic;

  axios.post(instance, { topic, ...message });
}

export type PublishMessage = {
  message?: string;
  title?: string;
  tags?: string[];
  priority?: 1 | 2 | 3 | 4 | 5;
  actions?: Action[];
  click?: string;
  attach?: string;
  icon?: string;
  filename?: string;
  delay?: string;
  // email?: string;
  // call?: string | 'yes';
};

export type Action = ViewAction | BroadcastAction | HttpAction;
export type ViewAction = {
  action: 'view';
  label: string;
  url: string;
  clear?: boolean;
};
export type BroadcastAction = {
  action: 'broadcast';
  label: string;
  intent?: string;
  extras?: Record<string, string>;
  clear?: boolean;
};
export type HttpAction = {
  action: 'http';
  label: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | string;
  headers?: Record<string, string>;
  body?: string;
  clear?: boolean;
};
