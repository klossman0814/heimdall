export interface KnownApp {
  name: string
  slug: string
  color: string
}

export const KNOWN_APPS: KnownApp[] = [
  { name: 'AdGuard', slug: 'adguard', color: '#68bc71' },
  { name: 'AdGuard Home', slug: 'adguard', color: '#68bc71' },
  { name: 'Audiobookshelf', slug: 'audiobookshelf', color: '#82612c' },
  { name: 'Authentik', slug: 'goauthentik', color: '#fd4b2d' },
  { name: 'Bazarr', slug: 'bazarr', color: '#4b8bbe' },
  { name: 'Bitwarden', slug: 'bitwarden', color: '#175ddc' },
  { name: 'Calibre', slug: 'calibre', color: '#e67e22' },
  { name: 'Calibre Web', slug: 'calibreweb', color: '#e67e22' },
  { name: 'changedetection.io', slug: 'changedetection', color: '#2c3e50' },
  { name: 'Code Server', slug: 'code-server', color: '#0066cc' },
  { name: 'Cockpit', slug: 'cockpit', color: '#0066cc' },
  { name: 'CouchPotato', slug: 'couchpotato', color: '#c0392b' },
  { name: 'Dash', slug: 'dash', color: '#4b8bbe' },
  { name: 'Deluge', slug: 'deluge', color: '#1a5c9e' },
  { name: 'Diun', slug: 'diun', color: '#2c3e50' },
  { name: 'Docker', slug: 'docker', color: '#2496ed' },
  { name: 'Dozzle', slug: 'dozzle', color: '#4b8bbe' },
  { name: 'Duplicati', slug: 'duplicati', color: '#2c3e50' },
  { name: 'Emby', slug: 'emby', color: '#52b54b' },
  { name: 'File Browser', slug: 'filebrowser', color: '#2c3e50' },
  { name: 'Firefox', slug: 'firefox', color: '#ff7139' },
  { name: 'FreshRSS', slug: 'freshrss', color: '#4b8bbe' },
  { name: 'Ghost', slug: 'ghost', color: '#15171a' },
  { name: 'Git', slug: 'git', color: '#f05032' },
  { name: 'GitHub', slug: 'github', color: '#181717' },
  { name: 'GitLab', slug: 'gitlab', color: '#fc6d26' },
  { name: 'Gitea', slug: 'gitea', color: '#609926' },
  { name: 'Grafana', slug: 'grafana', color: '#f46800' },
  { name: 'Grocy', slug: 'grocy', color: '#4b8bbe' },
  { name: 'HAProxy', slug: 'haproxy', color: '#2c3e50' },
  { name: 'Home Assistant', slug: 'home-assistant', color: '#18bcf2' },
  { name: 'Homepage', slug: 'homepage', color: '#2c3e50' },
  { name: 'Homer', slug: 'homer', color: '#4b8bbe' },
  { name: 'Immich', slug: 'immich', color: '#4250c7' },
  { name: 'InfluxDB', slug: 'influxdb', color: '#22adf6' },
  { name: 'Jackett', slug: 'jackett', color: '#2c3e50' },
  { name: 'Jellyfin', slug: 'jellyfin', color: '#00a4dc' },
  { name: 'Jenkins', slug: 'jenkins', color: '#d24939' },
  { name: 'Jupyter', slug: 'jupyter', color: '#f37626' },
  { name: 'Komga', slug: 'komga', color: '#2c3e50' },
  { name: 'Kubernetes', slug: 'kubernetes', color: '#326ce5' },
  { name: 'Lidarr', slug: 'lidarr', color: '#4b8bbe' },
  { name: 'Matomo', slug: 'matomo', color: '#3152a0' },
  { name: 'Mealie', slug: 'mealie', color: '#2c3e50' },
  { name: 'Memos', slug: 'usememos', color: '#6366f1' },
  { name: 'Metabase', slug: 'metabase', color: '#509ee3' },
  { name: 'MinIO', slug: 'minio', color: '#c72e49' },
  { name: 'MongoDB', slug: 'mongodb', color: '#47a248' },
  { name: 'Mosquitto', slug: 'eclipse-mosquitto', color: '#3c5280' },
  { name: 'MySQL', slug: 'mysql', color: '#4479a1' },
  { name: 'n8n', slug: 'n8n', color: '#ea4b71' },
  { name: 'Navidrome', slug: 'navidrome', color: '#2c3e50' },
  { name: 'Netdata', slug: 'netdata', color: '#00ab44' },
  { name: 'Nextcloud', slug: 'nextcloud', color: '#0082c9' },
  { name: 'Nginx', slug: 'nginx', color: '#009639' },
  { name: 'Nginx Proxy Manager', slug: 'nginxproxymanager', color: '#c0392b' },
  { name: 'Node-RED', slug: 'nodered', color: '#8f0000' },
  { name: 'NZBGet', slug: 'nzbget', color: '#e67e22' },
  { name: 'OctoPrint', slug: 'octoprint', color: '#13c100' },
  { name: 'Ollama', slug: 'ollama', color: '#2c3e50' },
  { name: 'Open Media Vault', slug: 'openmediavault', color: '#2c3e50' },
  { name: 'OpenVPN', slug: 'openvpn', color: '#ea7e20' },
  { name: 'OpenWrt', slug: 'openwrt', color: '#2c3e50' },
  { name: 'Overseerr', slug: 'overseerr', color: '#2c3e50' },
  { name: 'Paperless-ngx', slug: 'paperless-ngx', color: '#17541f' },
  { name: 'Photoprism', slug: 'photoprism', color: '#4b8bbe' },
  { name: 'Pi-hole', slug: 'pihole', color: '#f60' },
  { name: 'Plex', slug: 'plex', color: '#e5a00d' },
  { name: 'Portainer', slug: 'portainer', color: '#13bef9' },
  { name: 'PostgreSQL', slug: 'postgresql', color: '#4169e1' },
  { name: 'Prometheus', slug: 'prometheus', color: '#e6522c' },
  { name: 'Proxmox', slug: 'proxmox', color: '#e5702b' },
  { name: 'Prowlarr', slug: 'prowlarr', color: '#4b8bbe' },
  { name: 'PufferPanel', slug: 'pufferpanel', color: '#2c3e50' },
  { name: 'Pyload', slug: 'pyload', color: '#2c3e50' },
  { name: 'qBittorrent', slug: 'qbittorrent', color: '#2f67ba' },
  { name: 'Radarr', slug: 'radarr', color: '#e83a4b' },
  { name: 'Readarr', slug: 'readarr', color: '#4b8bbe' },
  { name: 'Redis', slug: 'redis', color: '#dc382d' },
  { name: 'Romm', slug: 'romm', color: '#2c3e50' },
  { name: 'Sabnzbd', slug: 'sabnzbd', color: '#e67e22' },
  { name: 'Samba', slug: 'samba', color: '#2c3e50' },
  { name: 'Scrutiny', slug: 'scrutiny', color: '#2c3e50' },
  { name: 'Shlink', slug: 'shlink', color: '#2c3e50' },
  { name: 'Snipe-IT', slug: 'snipe-it', color: '#339933' },
  { name: 'Sonarr', slug: 'sonarr', color: '#2596be' },
  { name: 'Speedtest Tracker', slug: 'speedtest', color: '#2c3e50' },
  { name: 'Syncthing', slug: 'syncthing', color: '#0891d1' },
  { name: 'Tautulli', slug: 'tautulli', color: '#e67e22' },
  { name: 'Traccar', slug: 'traccar', color: '#2c3e50' },
  { name: 'Traefik', slug: 'traefik', color: '#24a1c1' },
  { name: 'Transmission', slug: 'transmission', color: '#1793c3' },
  { name: 'TrueNAS', slug: 'truenas', color: '#0095d5' },
  { name: 'Ubooquity', slug: 'ubooquity', color: '#2c3e50' },
  { name: 'UniFi', slug: 'ubiquiti', color: '#0559c9' },
  { name: 'Uptime Kuma', slug: 'uptimekuma', color: '#5cdd8b' },
  { name: 'Vaultwarden', slug: 'vaultwarden', color: '#175ddc' },
  { name: 'Wg Gen Web', slug: 'wireguard', color: '#88171a' },
  { name: 'Whoogle', slug: 'whoogle', color: '#2c3e50' },
  { name: 'Wiki.js', slug: 'wikijs', color: '#1976d2' },
  { name: 'WireGuard', slug: 'wireguard', color: '#88171a' },
  { name: 'Wireshark', slug: 'wireshark', color: '#1679a7' },
  { name: 'WordPress', slug: 'wordpress', color: '#21759b' },
  { name: 'XigmaNAS', slug: 'xigmanas', color: '#2c3e50' },
  { name: 'Zabbix', slug: 'zabbix', color: '#cc0000' },
  { name: 'Zigbee2MQTT', slug: 'zigbee2mqtt', color: '#ff6600' },
  { name: 'Zipline', slug: 'zipline', color: '#2c3e50' },
]

export function findApp(name: string): KnownApp | undefined {
  const key = name.toLowerCase().trim()
  return KNOWN_APPS.find(
    (a) => a.name.toLowerCase() === key || a.slug.toLowerCase() === key
  )
}

export function searchApps(query: string): KnownApp[] {
  if (query.length < 1) return []
  const q = query.toLowerCase()
  return KNOWN_APPS.filter(
    (a) =>
      a.name.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q)
  ).slice(0, 8)
}

export function resolveIconUrl(name: string): string {
  const app = findApp(name)
  if (app) {
    return `https://cdn.simpleicons.org/${app.slug}/${app.color.replace('#', '')}`
  }
  return ''
}
