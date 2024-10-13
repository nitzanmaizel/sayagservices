import { oAuth2Client } from '../config/oauth2Client';
import AdminUser from '../models/UserModal';

export const refreshAccessToken = async (userId: string): Promise<void> => {
  const adminUser = await AdminUser.findById(userId);

  if (!adminUser || !adminUser.refreshToken) {
    throw new Error('User not found or refresh token missing');
  }

  oAuth2Client.setCredentials({ refresh_token: adminUser.refreshToken });

  try {
    const { credentials } = await oAuth2Client.refreshAccessToken();

    adminUser.accessToken = credentials.access_token!;
    adminUser.tokenExpiryDate = credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : undefined;

    await adminUser.save();
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Could not refresh access token');
  }
};
