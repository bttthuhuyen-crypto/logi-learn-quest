import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Link2, FileSpreadsheet } from 'lucide-react';
import { EmailInviteTab } from './invite/EmailInviteTab';
import { InviteLinkTab } from './invite/InviteLinkTab';
import { CSVImportTab } from './invite/CSVImportTab';

interface InviteMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteMembersModal = ({ open, onOpenChange }: InviteMembersModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ➕ Mời thành viên
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Mời qua Email</span>
              <span className="sm:hidden">Email</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Link mời</span>
              <span className="sm:hidden">Link</span>
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Import CSV</span>
              <span className="sm:hidden">CSV</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="email" className="mt-0">
              <EmailInviteTab />
            </TabsContent>

            <TabsContent value="link" className="mt-0">
              <InviteLinkTab />
            </TabsContent>

            <TabsContent value="csv" className="mt-0">
              <CSVImportTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
