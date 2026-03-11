import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, Copy, Check, Mail, Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

export default function ShareCalendarDialog({ isOpen, onOpenChange }) {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const generateShareLink = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateShareableCalendar', {});
      setShareUrl(response.data.shareUrl);
      toast.success('Share link generated!');
    } catch (error) {
      toast.error('Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmailReminder = async () => {
    if (!recipientEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setSendingEmail(true);
    try {
      // Get upcoming tasks and events
      const tasks = await base44.entities.Task.filter({
        completed: false,
        due_date: { $gte: format(new Date(), 'yyyy-MM-dd'), $lte: format(addDays(new Date(), 7), 'yyyy-MM-dd') }
      });

      const events = await base44.entities.SpecialEvent.filter({
        date: { $gte: format(new Date(), 'yyyy-MM-dd'), $lte: format(addDays(new Date(), 7), 'yyyy-MM-dd') }
      });

      await base44.functions.invoke('sendFamilyReminder', {
        recipientEmail,
        recipientName,
        message: shareUrl ? `You can view our family calendar anytime at: ${shareUrl}` : 'Here\'s what\'s coming up this week!',
        tasks: tasks.slice(0, 5),
        events: events.slice(0, 3)
      });

      toast.success(`Reminder sent to ${recipientEmail}!`);
      setRecipientEmail('');
      setRecipientName('');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const exportToPDF = async () => {
    setExportingPDF(true);
    try {
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

      const response = await fetch(
        await base44.functions.invoke('exportCalendarPDF', {
          startDate,
          endDate
        }).then(r => r.data)
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `family-calendar-${startDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success('Calendar exported to PDF!');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Share Family Calendar</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Generate Share Link */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Link2 className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-medium">Shareable Link</span>
            </div>
            
            {!shareUrl ? (
              <Button
                onClick={generateShareLink}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Share Link'
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="rounded-xl text-sm"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="icon"
                    className="rounded-xl flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" strokeWidth={1.5} />
                    ) : (
                      <Copy className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Link expires in 30 days • Read-only access</p>
              </div>
            )}
          </div>

          {/* Send Email Reminder */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-medium">Email Reminder</span>
            </div>
            
            <Input
              placeholder="Family member's name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="rounded-xl"
            />
            
            <Input
              type="email"
              placeholder="Email address"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="rounded-xl"
            />
            
            <Button
              onClick={sendEmailReminder}
              disabled={sendingEmail || !recipientEmail}
              variant="outline"
              className="w-full rounded-xl"
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Send Weekly Update
                </>
              )}
            </Button>
          </div>

          {/* Export PDF */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Download className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-medium">Export Calendar</span>
            </div>
            
            <Button
              onClick={exportToPDF}
              disabled={exportingPDF}
              variant="outline"
              className="w-full rounded-xl"
            >
              {exportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Export to PDF (Next 30 Days)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}