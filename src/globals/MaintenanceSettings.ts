import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/lib/admin'

export const MaintenanceSettings: GlobalConfig = {
  slug: 'maintenance-settings',
  label: 'Maintenance',
  admin: {
    group: adminGroups.settings,
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'enabled',
      label: 'Maintenance mode',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Show an under-maintenance page across the public site. The admin panel stays available.',
      },
    },
  ],
}
