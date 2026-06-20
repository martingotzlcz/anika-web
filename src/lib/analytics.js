import { base44 } from '@/api/base44Client';
import { v4 as uuidv4 } from 'uuid';

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getVisitorId() {
  let id = localStorage.getItem('_am_vid');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('_am_vid', id);
  }
  return id;
}

function getSessionId() {
  let id = sessionStorage.getItem('_am_sid');
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem('_am_sid', id);
  }
  return id;
}

export function trackPageVisit(pageName) {
  const visitor_id = getVisitorId();
  const session_id = getSessionId();
  const device_type = getDeviceType();
  const referrer = document.referrer || '';

  base44.entities.PageVisit.create({
    page: pageName,
    visitor_id,
    session_id,
    referrer,
    user_agent: navigator.userAgent.substring(0, 200),
    device_type,
  }).catch(() => {});
}