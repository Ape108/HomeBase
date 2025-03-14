const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = process.env.GOOGLE_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/drive.file',       // Only access files the user explicitly selects
    'https://www.googleapis.com/auth/userinfo.email',   // Just to identify the user account
    'https://www.googleapis.com/auth/userinfo.profile', // Just for the user's name
    'https://www.googleapis.com/auth/drive.metadata.readonly' // Required for file metadata
].join(' ');

// Add token persistence
const TOKEN_STORAGE_KEY = 'google_auth_token';

// Update token storage to handle multiple accounts
const ACCOUNTS_STORAGE_KEY = 'google_accounts';

// Get all stored accounts with better logging
const getStoredAccounts = () => {
  try {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    console.log('Raw stored accounts data:', stored);
    
    const accounts = stored ? JSON.parse(stored) : [];
    console.log('Parsed accounts:', accounts);
    
    // Log each account's data
    accounts.forEach((acc, index) => {
      console.log(`Account ${index + 1}:`, {
        email: acc.email,
        name: acc.name,
        hasToken: !!acc.token,
        expiry: new Date(acc.expiry).toLocaleString(),
        isValid: acc.expiry > Date.now()
      });
    });

    return accounts;
  } catch (error) {
    console.error('Error reading stored accounts:', error);
    return [];
  }
};

// Clean up invalid accounts and remove malformed entries
const cleanupAccounts = () => {
    try {
        const accounts = getStoredAccounts();
        const validAccounts = accounts.filter(acc => 
            acc.email && 
            acc.name && 
            acc.token && 
            acc.expiry && 
            acc.expiry > Date.now()
        );
        
        console.log('Cleaning up accounts:', {
            before: accounts.length,
            after: validAccounts.length,
            removed: accounts.length - validAccounts.length
        });

        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(validAccounts));
        return validAccounts;
    } catch (error) {
        console.error('Error cleaning up accounts:', error);
        return [];
    }
};

// Store account info with validation
const storeAccount = async (token, userInfo) => {
  try {
    console.log('Storing account with info:', {
      email: userInfo.email,
      name: userInfo.name,
      picture: !!userInfo.picture,
      token: !!token.access_token,
      expiresIn: token.expires_in
    });

    // Clean up existing accounts first
    const accounts = cleanupAccounts();
    
    if (!userInfo.email || !token.access_token) {
      throw new Error('Invalid account data - missing required fields');
    }

    const accountData = {
      email: userInfo.email,
      name: userInfo.name || userInfo.email.split('@')[0],
      picture: userInfo.picture,
      token: token.access_token,
      expiry: Date.now() + (token.expires_in * 1000)
    };

    const existingIndex = accounts.findIndex(acc => acc.email === userInfo.email);
    
    if (existingIndex >= 0) {
      accounts[existingIndex] = accountData;
    } else {
      accounts.push(accountData);
    }

    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    console.log('Account stored successfully');

    return accountData;
  } catch (error) {
    console.error('Error storing account:', error);
    throw error;
  }
};

// Get user info after authentication
const getUserInfo = async (accessToken) => {
  try {
    console.log('Fetching user info with token:', accessToken.substring(0, 10) + '...');
    
    // Add proper headers and handle response
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('User info fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        token: accessToken.substring(0, 10) + '...',
        headers: Object.fromEntries(response.headers.entries())
      });

      // Try to refresh token if unauthorized
      if (response.status === 401) {
        console.log('Token expired, requesting new token...');
        const newToken = await new Promise((resolve) => {
          const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: OAUTH_SCOPES,
            callback: (response) => {
              if (response.access_token) {
                resolve(response.access_token);
              }
            }
          });
          tokenClient.requestAccessToken({ prompt: '' });
        });

        // Retry with new token
        console.log('Retrying with new token...');
        const retryResponse = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 
            'Authorization': `Bearer ${newToken}`,
            'Accept': 'application/json'
          }
        });

        if (!retryResponse.ok) {
          throw new Error(`Failed to fetch user info: ${response.status} - ${await retryResponse.text()}`);
        }

        const data = await retryResponse.json();
        console.log('User info received after retry:', {
          email: data.email,
          name: data.name,
          picture: !!data.picture
        });

        return {
          email: data.email,
          name: data.name || data.email.split('@')[0],
          picture: data.picture,
          token: newToken  // Include new token
        };
      }

      throw new Error(`Failed to fetch user info: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('User info received:', {
      email: data.email,
      name: data.name,
      picture: !!data.picture
    });

    return {
      email: data.email,
      name: data.name || data.email.split('@')[0],
      picture: data.picture,
      token: accessToken  // Include current token
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

// Try to get stored token
const getStoredToken = () => {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading stored token:', error);
    return null;
  }
};

// Store token
const storeToken = (token) => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Helper function to wait for libraries to load
const waitForLibraries = () => {
    return new Promise((resolve, reject) => {
        const checkLibraries = () => {
            console.log('Checking libraries status:', {
                gapi: !!window.gapi,
                google: !!window.google,
                picker: !!(window.google && window.google.picker),
                oauth2: !!(window.google && window.google.accounts && window.google.accounts.oauth2)
            });

            if (window.gapi && 
                window.google && 
                window.google.accounts && 
                window.google.accounts.oauth2 && 
                window.google.picker) {
                resolve();
            } else {
                setTimeout(checkLibraries, 100);
            }
        };
        checkLibraries();
        setTimeout(() => reject(new Error('Timeout waiting for libraries to load')), 10000);
    });
};

// Add new function to load picker API
const loadPickerApi = () => {
    console.log('Loading Picker API...');
    return new Promise((resolve, reject) => {
        window.gapi.load('picker', {
            callback: () => {
                console.log('✅ Picker API loaded successfully');
                resolve();
            },
            onerror: (error) => {
                console.error('❌ Error loading Picker API:', error);
                reject(error);
            }
        });
    });
};

// Near the top of the file, add this logging
console.log('Environment variables check on load:', {
  hasClientId: !!process.env.GOOGLE_CLIENT_ID,
  clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
  hasApiKey: !!process.env.GOOGLE_API_KEY,
  apiKeyLength: process.env.GOOGLE_API_KEY?.length,
  nodeEnv: process.env.NODE_ENV,
  viteMode: import.meta.env.MODE
});

// Log the values immediately
console.log('API Credentials on module load:', {
  clientIdExists: !!CLIENT_ID,
  apiKeyExists: !!API_KEY
});

// Enhance the initGoogleApi function
export const initGoogleApi = async () => {
  console.log('%c Google API Initialization Started', 'background: #222; color: #bada55');
  
  // Log more details about environment variables
  console.log('Detailed environment check:', {
    clientId: {
      exists: !!CLIENT_ID,
      length: CLIENT_ID?.length,
      firstChars: CLIENT_ID?.substring(0, 5),
      type: typeof CLIENT_ID
    },
    apiKey: {
      exists: !!API_KEY,
      length: API_KEY?.length,
      firstChars: API_KEY?.substring(0, 5),
      type: typeof API_KEY
    },
    envVars: {
      direct: {
        clientId: {
          exists: !!process.env.GOOGLE_CLIENT_ID,
          length: process.env.GOOGLE_CLIENT_ID?.length
        },
        apiKey: {
          exists: !!process.env.GOOGLE_API_KEY,
          length: process.env.GOOGLE_API_KEY?.length
        }
      },
      vite: {
        clientId: {
          exists: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
          length: import.meta.env.VITE_GOOGLE_CLIENT_ID?.length
        },
        apiKey: {
          exists: !!import.meta.env.VITE_GOOGLE_API_KEY,
          length: import.meta.env.VITE_GOOGLE_API_KEY?.length
        }
      }
    },
    window: {
      origin: window.location.origin,
      hostname: window.location.hostname
    }
  });
  
  // Add more detailed error handling around the credential check
  if (!API_KEY || !CLIENT_ID) {
    console.error('❌ Missing API credentials:', {
      apiKey: !!API_KEY,
      clientId: !!CLIENT_ID
    });
    throw new Error('Google API credentials not found. Check .env file.');
  }
  
  try {
    // Add progress logging
    console.log('Waiting for libraries to load...');
    await waitForLibraries();
    console.log('Libraries loaded successfully');

    // Load required GAPI components
    await new Promise((resolve, reject) => {
        window.gapi.load('client:picker', {
            callback: resolve,
            onerror: reject
        });
    });
    console.log('✅ GAPI client and picker loaded');

    // Initialize the client
    await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    console.log('✅ GAPI client initialized');

    // Load Drive API
    await window.gapi.client.load('drive', 'v3');
    console.log('✅ Drive API loaded');
    
    return true;
  } catch (error) {
    console.error('❌ Initialization failed with details:', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      apiKeyExists: !!API_KEY,
      clientIdExists: !!CLIENT_ID
    });
    throw error;
  }
};

export const handleAuth = async (isNewAccount = false) => {
    console.log('🚀 Starting authentication process...');
    try {
        await waitForLibraries();

        return new Promise((resolve, reject) => {
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: OAUTH_SCOPES,
                callback: async (tokenResponse) => {
                    console.log('Token response received:', {
                        hasError: !!tokenResponse.error,
                        hasToken: !!tokenResponse.access_token
                    });

                    if (tokenResponse.error) {
                        reject(tokenResponse.error);
                        return;
                    }

                    if (!tokenResponse.access_token) {
                        reject(new Error('No access token received'));
                        return;
                    }

                    try {
                        // Set the token for GAPI client
                        gapi.client.setToken(tokenResponse);

                        // Get user info using fetch instead of gapi.client.request
                        const userInfoResponse = await fetch(
                            'https://www.googleapis.com/oauth2/v2/userinfo',
                            {
                                headers: {
                                    'Authorization': `Bearer ${tokenResponse.access_token}`
                                }
                            }
                        );

                        if (!userInfoResponse.ok) {
                            throw new Error(`Failed to get user info: ${userInfoResponse.status}`);
                        }

                        const userInfo = await userInfoResponse.json();
                        console.log('User info received:', userInfo);

                        // Store account info with all required fields
                        const accountData = {
                            email: userInfo.email,
                            name: userInfo.name || userInfo.email.split('@')[0],
                            picture: userInfo.picture,
                            token: tokenResponse.access_token,
                            expiry: Date.now() + (tokenResponse.expires_in * 1000)
                        };

                        console.log('Storing account data:', {
                            ...accountData,
                            token: accountData.token.substring(0, 10) + '...'
                        });

                        // Store in localStorage
                        const accounts = getStoredAccounts();
                        const existingIndex = accounts.findIndex(acc => acc.email === accountData.email);
                        
                        if (existingIndex >= 0) {
                            accounts[existingIndex] = accountData;
                        } else {
                            accounts.push(accountData);
                        }

                        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
                        console.log('Account stored successfully');

                        resolve(accountData);
                    } catch (error) {
                        console.error('Error getting user info:', error);
                        reject(error);
                    }
                }
            });

            console.log('Requesting access token...');
            tokenClient.requestAccessToken({
                prompt: isNewAccount ? 'consent' : 'select_account'
            });
        });
    } catch (error) {
        console.error('❌ Auth error:', error);
        throw error;
    }
};

// Get available accounts with better filtering
export const getAvailableAccounts = () => {
    try {
        // Clean up accounts first
        const accounts = cleanupAccounts();
        console.log('Available accounts after cleanup:', accounts.map(acc => ({
            email: acc.email,
            name: acc.name,
            hasToken: !!acc.token,
            expiry: new Date(acc.expiry).toLocaleString()
        })));
        
        return accounts.sort((a, b) => a.email.localeCompare(b.email));
    } catch (error) {
        console.error('Error getting available accounts:', error);
        return [];
    }
};

export const openFilePicker = async (panelType, accountEmail) => {
    console.log(`🚀 Opening file picker for ${panelType} with account ${accountEmail}`);
    try {
        const accounts = getStoredAccounts();
        const account = accounts.find(acc => acc.email === accountEmail);
        
        if (!account) {
            throw new Error('Account not found');
        }

        // Set the token for GAPI client
        gapi.client.setToken({ access_token: account.token });

        return new Promise((resolve, reject) => {
            const picker = new google.picker.PickerBuilder()
                .addView(new google.picker.DocsView()
                    .setMimeTypes([
                        'application/vnd.google-apps.document',  // Google Docs
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // Word docs
                        'application/pdf'  // PDFs
                    ].join(','))
                    .setMode('READ_WRITE')  // Add this line to ensure read/write access
                )
                .setOAuthToken(account.token)
                .setDeveloperKey(API_KEY)
                .setCallback(async (data) => {
                    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                        const doc = data[google.picker.Response.DOCUMENTS][0];
                        console.log('Document picked:', doc);
                        
                        try {
                            console.log('Fetching document details...');
                            const response = await gapi.client.drive.files.get({
                                fileId: doc.id,
                                fields: '*',
                                supportsAllDrives: true
                            });
                            console.log('Document details response:', response);

                            // Handle preview URL based on mime type
                            let previewUrl;
                            let editUrl;
                            const mimeType = response.result.mimeType;

                            if (mimeType === 'application/pdf') {
                                previewUrl = `https://drive.google.com/file/d/${doc.id}/preview`;
                                editUrl = previewUrl;
                            } else if (mimeType === 'application/vnd.google-apps.document') {
                                previewUrl = `https://docs.google.com/document/d/${doc.id}/preview`;
                                editUrl = `https://docs.google.com/document/d/${doc.id}/edit?usp=sharing`;
                            } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                                previewUrl = `https://drive.google.com/file/d/${doc.id}/preview`;
                                editUrl = `https://docs.google.com/document/d/${doc.id}/edit?usp=sharing`;
                            }
                            
                            const docData = {
                                id: response.result.id,
                                name: response.result.name,
                                url: response.result.webViewLink,
                                thumbnailLink: previewUrl,
                                editLink: editUrl,
                                mimeType: response.result.mimeType,
                                exportLinks: response.result.exportLinks
                            };
                            
                            console.log('Resolving with document data:', docData);
                            resolve(docData);
                        } catch (error) {
                            console.error('Error fetching document details:', error);
                            reject(error);
                        }
                    } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
                        console.log('Picker cancelled by user');
                        resolve(null);
                    }
                })
                .build();

            picker.setVisible(true);
        });
    } catch (error) {
        console.error('❌ Error in openFilePicker:', error);
        throw error;
    }
}; 