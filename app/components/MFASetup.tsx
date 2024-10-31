'use client';

import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import QRCode from 'qrcode.react';

interface MFASetupProps {
  onComplete: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function MFASetup({ onComplete, isLoading, setIsLoading }: MFASetupProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const { getAccessTokenSilently } = useAuth0();
  const [mfaType, setMfaType] = useState<'none' | 'authenticator' | 'sms'>('none');

  const setupMFA = async () => {
    if (mfaType === 'none') {
      onComplete();
      return;
    }

    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/auth/mfa/enroll', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: mfaType }),
      });

      if (!response.ok) {
        throw new Error('Failed to set up MFA');
      }

      const data = await response.json();

      if (mfaType === 'authenticator') {
        setQRCodeData(data.qrCode);
        setShowQRCode(true);
      } else if (mfaType === 'sms') {
        toast.success('Please enter the code sent to your phone');
      }
    } catch (error) {
      console.error('MFA setup error:', error);
      toast.error('Failed to set up MFA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: verificationCode,
          type: mfaType 
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      toast.success('MFA setup complete!');
      setShowQRCode(false);
      onComplete();
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={mfaType}
            onValueChange={(value: 'none' | 'authenticator' | 'sms') => setMfaType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select MFA type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No 2FA</SelectItem>
              <SelectItem value="authenticator">Authenticator App</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={setupMFA}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Setting up...' : 'Continue'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              {qrCodeData && <QRCode value={qrCodeData} size={200} />}
            </div>
            <Input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <Button 
              onClick={verifyCode} 
              disabled={!verificationCode || isLoading}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
