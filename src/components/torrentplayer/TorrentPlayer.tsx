import React, { useState, useEffect, useRef, useCallback } from 'react';
import Artplayer from 'artplayer';
import WebTorrent from 'webtorrent';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardActions,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  FolderOpen as FolderOpenIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Folder as FolderIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

// --- Type Definitions ---
interface TorrentFile {
  name: string;
  length: number;
  type: string;
  path: string;
  select: () => void;
  createReadStream: (opts?: any) => any; // NodeJS.ReadableStream
  getBlobURL: (callback: (err: Error | null, url?: string) => void) => void;
  done: boolean;
}

interface Torrent {
  infoHash: string;
  name: string;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  length: number;
  downloaded: number;
  files: TorrentFile[];
  path: string;
  paused: boolean;
  done: boolean;
  destroy: () => void;
  pause: () => void;
  resume: () => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
}

interface TorrentClient {
  add: (
    torrentId: string | Buffer,
    opts?: any,
    callback?: (torrent: Torrent) => void
  ) => Torrent;
  get: (infoHash: string) => Torrent | null;
  remove: (infoHash: string, callback?: Function) => void;
  destroy: () => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
  torrents: Torrent[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// --- Helper Components ---
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`torrent-tabpanel-${index}`}
      aria-labelledby={`torrent-tab-${index}`}
      {...other}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// --- Main Component ---
const TorrentPlayer: React.FC = () => {
  // --- State Management ---
  const [client, setClient] = useState<TorrentClient | null>(null);
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [selectedTorrent, setSelectedTorrent] = useState<Torrent | null>(null);
  const [selectedFile, setSelectedFile] = useState<TorrentFile | null>(null);
  const [addTorrentDialogOpen, setAddTorrentDialogOpen] = useState(false);
  const [torrentUrl, setTorrentUrl] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Settings State
  const [downloadPath, setDownloadPath] = useState('');
  const [maxConns, setMaxConns] = useState(50);
  const [uploadLimit, setUploadLimit] = useState(0); // KB/s, 0 = unlimited
  const [downloadLimit, setDownloadLimit] = useState(0); // KB/s, 0 = unlimited
  const [seedRatio, setSeedRatio] = useState(1);
  const [autoStart, setAutoStart] = useState(true);

  // Notification State
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  // Refs
  const playerRef = useRef<HTMLDivElement>(null);
  const artPlayerRef = useRef<Artplayer | null>(null);

  // --- Effects ---
  // Initialize WebTorrent client
  useEffect(() => {
    const torrentClient = new WebTorrent({
      dht: true,
      tracker: true,
      webSeeds: true,
      maxConns: maxConns,
      uploadThrottle: uploadLimit > 0 ? uploadLimit * 1024 : -1,
      downloadThrottle: downloadLimit > 0 ? downloadLimit * 1024 : -1,
    });
    setClient(torrentClient);

    // Load saved settings
    const savedSettings = localStorage.getItem('torrentSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDownloadPath(settings.downloadPath || '');
      setMaxConns(settings.maxConns || 50);
      setUploadLimit(settings.uploadLimit || 0);
      setDownloadLimit(settings.downloadLimit || 0);
      setSeedRatio(settings.seedRatio || 1);
      setAutoStart(settings.autoStart !== undefined ? settings.autoStart : true);
    }

    // Cleanup on unmount
    return () => {
      if (torrentClient) {
        torrentClient.destroy();
      }
    };
  }, []); // Run only once on mount

  // Update client throttle settings when they change
  useEffect(() => {
    if (client) {
      client.torrents.forEach(torrent => {
        // Note: WebTorrent doesn't support updating throttle on the fly after creation.
        // This requires a restart of the client for changes to take effect.
        // For simplicity, we'll note this limitation.
        console.log('Throttle settings changed. A client restart is needed for full effect.');
      });
    }
  }, [uploadLimit, downloadLimit, maxConns, client]);

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      downloadPath,
      maxConns,
      uploadLimit,
      downloadLimit,
      seedRatio,
      autoStart,
    };
    localStorage.setItem('torrentSettings', JSON.stringify(settings));
  }, [downloadPath, maxConns, uploadLimit, downloadLimit, seedRatio, autoStart]);

  // Initialize Artplayer when selectedFile changes
  useEffect(() => {
    if (!selectedFile || !playerRef.current) return;

    // Destroy previous player if exists
    if (artPlayerRef.current) {
      artPlayerRef.current.destroy();
      artPlayerRef.current = null;
    }

    // Create blob URL for the selected file
    selectedFile.getBlobURL((err, url) => {
      if (err) {
        showNotification(`Error creating video URL: ${err.message}`, 'error');
        return;
      }
      if (!url) return;

      // Initialize Artplayer
      const art = new Artplayer({
        container: playerRef.current,
        url: url,
        title: selectedFile.name,
        autoplay: true,
        screenshot: true,
        hotkey: true,
        pip: true,
        fullscreen: true,
        fullscreenWeb: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        theme: '#23ade5',
        lang: navigator.language.toLowerCase(),
        settings: [
            {
                html: 'Info',
                click: function() {
                    showNotification(`Playing: ${selectedFile.name}`, 'info');
                },
            },
        ],
      });

      artPlayerRef.current = art;
    });

    // Cleanup on unmount or when file changes
    return () => {
      if (artPlayerRef.current) {
        artPlayerRef.current.destroy();
        artPlayerRef.current = null;
      }
    };
  }, [selectedFile]);


  // --- Helper Functions ---
  const showNotification = (message: string, severity: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  // --- Torrent Management Functions ---
  const addTorrent = useCallback((torrentId: string) => {
    if (!client) return;

    const options: any = {
      path: downloadPath || undefined,
      store: typeof window !== 'undefined' ? window.fs : undefined, // Use memory store in browser
    };

    const torrent = client.add(torrentId, options, (torrent) => {
      setTorrents(prev => [...prev, torrent]);
      showNotification(`Added torrent: ${torrent.name}`, 'success');
    });

    // Set up event listeners
    const onProgress = () => setTorrents(prev => [...prev]);
    const onDone = () => {
      showNotification(`Download completed: ${torrent.name}`, 'success');
      setTorrents(prev => prev.map(t => t.infoHash === torrent.infoHash ? { ...t, done: true } : t));
    };
    const onError = (err: Error) => {
      showNotification(`Error with ${torrent.name}: ${err.message}`, 'error');
      setTorrents(prev => prev.filter(t => t.infoHash !== torrent.infoHash));
    };

    torrent.on('download', onProgress);
    torrent.on('upload', onProgress);
    torrent.on('done', onDone);
    torrent.on('error', onError);

    return torrent;
  }, [client, downloadPath]);

  const handleAddTorrent = () => {
    if (!torrentUrl.trim()) {
      showNotification('Please enter a magnet link or torrent URL.', 'warning');
      return;
    }
    try {
      addTorrent(torrentUrl);
      setTorrentUrl('');
      setAddTorrentDialogOpen(false);
    } catch (error: any) {
      showNotification(`Failed to add torrent: ${error.message}`, 'error');
    }
  };

  const handleRemoveTorrent = (infoHash: string) => {
    if (!client) return;
    const torrent = client.get(infoHash);
    if (torrent) {
      client.remove(torrent, () => {
        setTorrents(prev => prev.filter(t => t.infoHash !== infoHash));
        if (selectedTorrent?.infoHash === infoHash) {
          setSelectedTorrent(null);
          setSelectedFile(null);
        }
        showNotification('Torrent removed', 'info');
      });
    }
  };

  const handlePauseTorrent = (infoHash: string) => {
    const torrent = client?.get(infoHash);
    if (torrent) {
      if (torrent.paused) {
        torrent.resume();
        showNotification('Torrent resumed', 'info');
      } else {
        torrent.pause();
        showNotification('Torrent paused', 'info');
      }
      setTorrents(prev =>
        prev.map(t => t.infoHash === infoHash ? { ...t, paused: !t.paused } : t)
      );
    }
  };

  const handleSelectFile = (torrent: Torrent, file: TorrentFile) => {
    setSelectedTorrent(torrent);
    setSelectedFile(file);
    setTabValue(1); // Switch to player tab
  };

  const handleSelectDownloadFolder = async () => {
    try {
      // Use the exposed electronAPI from the preload script
      const path = await window.electronAPI.selectFolder();
      if (path) {
        setDownloadPath(path);
        showNotification(`Download path set to: ${path}`, 'success');
      }
    } catch (error: any) {
      showNotification(`Error selecting folder: ${error.message}`, 'error');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="torrent player tabs">
          <Tab label="Torrents" icon={<DownloadIcon />} />
          <Tab label="Player" icon={<PlayArrowIcon />} disabled={!selectedFile} />
          <Tab label="Settings" icon={<SettingsIcon />} />
        </Tabs>
      </Box>

      {/* Torrents Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">Torrents</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddTorrentDialogOpen(true)}>
            Add Torrent
          </Button>
        </Box>

        {torrents.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <Typography variant="h6" color="text.secondary">No torrents added</Typography>
            <Typography variant="body2" color="text.secondary">Add a magnet link or torrent file to get started</Typography>
          </Box>
        ) : (
          <List>
            {torrents.map((torrent) => (
              <Card key={torrent.infoHash} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{torrent.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatBytes(torrent.downloaded)} / {formatBytes(torrent.length)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      {Math.round(torrent.progress * 100)}%
                    </Typography>
                    {torrent.done && <Chip label="Completed" color="success" size="small" sx={{ ml: 2 }} />}
                    {torrent.paused && <Chip label="Paused" color="warning" size="small" sx={{ ml: 2 }} />}
                  </Box>
                  <LinearProgress variant="determinate" value={torrent.progress * 100} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                  <Box sx={{ display: 'flex', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <DownloadIcon fontSize="small" />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>{formatSpeed(torrent.downloadSpeed)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <UploadIcon fontSize="small" />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>{formatSpeed(torrent.uploadSpeed)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SpeedIcon fontSize="small" />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>{torrent.numPeers} peers</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={torrent.paused ? <PlayArrowIcon /> : <PauseIcon />} onClick={() => handlePauseTorrent(torrent.infoHash)}>
                    {torrent.paused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleRemoveTorrent(torrent.infoHash)}>
                    Remove
                  </Button>
                </CardActions>
                <Divider />
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2">Playable Files:</Typography>
                  <List dense>
                    {torrent.files
                      .filter(file => file.name.match(/\.(mp4|mkv|avi|mov|webm|flv)$/i))
                      .map((file, index) => (
                        <ListItem key={index} button onClick={() => handleSelectFile(torrent, file)}>
                          <ListItemText primary={file.name} secondary={formatBytes(file.length)} />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleSelectFile(torrent, file)}>
                              <PlayArrowIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                  </List>
                </Box>
              </Card>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Player Tab */}
      <TabPanel value={tabValue} index={1}>
        {selectedFile ? (
          <>
            <Typography variant="h4" sx={{ mb: 2 }}>Now Playing: {selectedFile.name}</Typography>
            <Box ref={playerRef} sx={{ width: '100%', flexGrow: 1, backgroundColor: 'black', borderRadius: 1, overflow: 'hidden' }} />
            {selectedTorrent && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1">Torrent Info</Typography>
                <Typography variant="body2">Name: {selectedTorrent.name}</Typography>
                <Typography variant="body2">Progress: {Math.round(selectedTorrent.progress * 100)}%</Typography>
                <Typography variant="body2">Download: {formatSpeed(selectedTorrent.downloadSpeed)}</Typography>
                <Typography variant="body2">Upload: {formatSpeed(selectedTorrent.uploadSpeed)}</Typography>
                <Typography variant="body2">Peers: {selectedTorrent.numPeers}</Typography>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <Typography variant="h6" color="text.secondary">No file selected</Typography>
            <Typography variant="body2" color="text.secondary">Select a playable file from the torrents list</Typography>
          </Box>
        )}
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Download Settings</Typography>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Download Path"
                    value={downloadPath}
                    onChange={(e) => setDownloadPath(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={handleSelectDownloadFolder}>
                          <FolderOpenIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Max Connections</InputLabel>
                    <Select value={maxConns} onChange={(e) => setMaxConns(Number(e.target.value))}>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={200}>200</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField fullWidth label="Download Limit (KB/s)" type="number" value={downloadLimit} onChange={(e) => setDownloadLimit(Number(e.target.value))} helperText="0 = unlimited" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField fullWidth label="Upload Limit (KB/s)" type="number" value={uploadLimit} onChange={(e) => setUploadLimit(Number(e.target.value))} helperText="0 = unlimited" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Seeding & Behavior</Typography>
                <Box sx={{ mb: 2 }}>
                  <TextField fullWidth label="Seed Ratio" type="number" inputProps={{ step: 0.1, min: 0 }} value={seedRatio} onChange={(e) => setSeedRatio(Number(e.target.value))} helperText="Stop seeding when this ratio is reached" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel control={<Switch checked={autoStart} onChange={(e) => setAutoStart(e.target.checked)} />} label="Auto-start torrents on app launch" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Torrent Dialog */}
      <Dialog open={addTorrentDialogOpen} onClose={() => setAddTorrentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Torrent</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Magnet Link or Torrent URL"
            fullWidth
            variant="outlined"
            value={torrentUrl}
            onChange={(e) => setTorrentUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTorrentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTorrent} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TorrentPlayer;