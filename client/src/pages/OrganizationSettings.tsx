import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Trash2, UserPlus, Shield, Eye, Calculator, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(['owner', 'admin', 'accountant', 'viewer']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface Member {
    member_id: string;
    user_id: string;
    role: string;
    joined_at: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    invited_by_name: string | null;
  }

interface Organization {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  fiscal_year_start: number;
}

const roleIcons = {
  owner: Shield,
  admin: Shield,
  accountant: Calculator,
  viewer: Eye,
};

const roleColors = {
  owner: "text-purple-600 bg-purple-50",
  admin: "text-blue-600 bg-blue-50",
  accountant: "text-green-600 bg-green-50",
  viewer: "text-gray-600 bg-gray-50",
};

export default function OrganizationSettings() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/org/:orgId/organization-settings");
  const orgId = params?. orgId;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role:  'viewer',
    }
  });

  // Load organization and members
  // Load organization and members
useEffect(() => {
    if (! orgId) {
      console.log("No orgId, redirecting.. .");
      return;
    }
  
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user, redirecting to login");
        setLocation("/");
        return;
      }
  
      console.log("Loading data for org:", orgId, "user:", user.id);
  
      // Load organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();
  
      if (orgError || !orgData) {
        console.error("Error loading organization:", orgError);
        setLocation("/create-organization");
        return;
      }
  
      console.log("Organization loaded:", orgData);
      setOrganization(orgData);
  
      // Load current user's role
      const { data: roleData, error: roleError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single();
  
      console.log("User role data:", roleData, "error:", roleError);
      setCurrentUserRole(roleData?.role || null);
  
      // Load all members
      await loadMembers();
      setIsLoading(false);
    };
  
    loadData();
  }, [orgId, setLocation]); // Add dependencies

  const loadMembers = async () => {
    if (!orgId) return;
  
    console.log("Loading members for org:", orgId);
  
    // Call the database function
    const { data: membersData, error: membersError } = await supabase
      .rpc('get_organization_members', {
        p_organization_id: orgId
      });
  
    console.log("Members data from function:", membersData);
    console.log("Members error:", membersError);
  
    if (membersError) {
      console.error("Error loading members:", membersError);
      return;
    }
  
    if (!membersData || membersData.length === 0) {
      console.warn("No members found in database");
      setMembers([]);
      return;
    }
  
    setMembers(membersData);
  };

  const onInviteMember = async (values: InviteFormData) => {
    setInviteError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !orgId) {
        setInviteError("Authentication error");
        return;
      }

      // Call database function to invite member
      const { data, error } = await supabase. rpc('invite_organization_member', {
        p_organization_id: orgId,
        p_email: values.email,
        p_role: values.role
      });

      if (error) {
        setInviteError(error.message);
        return;
      }

      // Reload members
      await loadMembers();
      setIsInviteDialogOpen(false);
      reset();
    } catch (err) {
      console.error("Error inviting member:", err);
      setInviteError("An unexpected error occurred");
    }
  };

  const removeMember = async (memberId:  string, memberUserId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Don't allow removing yourself if you're the last owner
    if (memberUserId === user.id) {
      const owners = members.filter(m => m.role === 'owner');
      if (owners.length === 1) {
        alert("Cannot remove the last owner. Please transfer ownership first.");
        return;
      }
    }

    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member:  " + error.message);
      return;
    }

    await loadMembers();
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    const { error } = await supabase
      .from('organization_members')
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role: " + error. message);
      return;
    }

    await loadMembers();
  };

  if (isLoading) {
    return (
      <Layout title="Organization Settings" description="Manage organization settings and members">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <Layout 
      title="Organization Settings" 
      description={`Manage ${organization?.name || 'organization'} settings and members`}
    >
      {/* Organization Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Organization Information</h2>
            <p className="text-sm text-gray-600">General settings for this organization</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Organization Name</label>
            <p className="text-base font-medium">{organization?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Slug</label>
            <p className="text-base font-mono text-sm bg-gray-50 px-3 py-1 rounded">{organization?.slug}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Currency</label>
            <p className="text-base">{organization?.currency}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Timezone</label>
            <p className="text-base">{organization?.timezone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Fiscal Year Start</label>
            <p className="text-base">
              {new Date(2024, (organization?.fiscal_year_start || 1) - 1, 1).toLocaleString('default', { month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Team Members</h2>
            <p className="text-sm text-gray-600">{members.length} member(s) in this organization</p>
          </div>
          {canManageMembers && (
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Add a new member to {organization?.name}.  They must already have an account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onInviteMember)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="colleague@example.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email. message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus: ring-2 focus:ring-blue-500"
                      {... register("role")}
                    >
                      <option value="viewer">Viewer - Read-only access</option>
                      <option value="accountant">Accountant - Manage finances</option>
                      <option value="admin">Admin - Manage members & settings</option>
                      <option value="owner">Owner - Full control</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose the permission level for this member
                    </p>
                  </div>
                  {inviteError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{inviteError}</p>
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsInviteDialogOpen(false);
                        reset();
                        setInviteError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Inviting..." : "Invite Member"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Members List */}
        {/* Members List */}
{/* Members List */}
<div className="space-y-3">
  {members.map((member) => {
    const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || Eye;
    const roleColor = roleColors[member.role as keyof typeof roleColors] || roleColors.viewer;

    return (
      <div
        key={member.member_id}  // Changed from member.id
        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt={member.full_name} className="w-12 h-12 rounded-full" />
            ) : (
              <span className="text-base font-semibold text-primary">
                {member.full_name?. substring(0, 2).toUpperCase() || '?? '}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-base">{member.full_name || 'Unknown User'}</p>
            <p className="text-sm text-gray-600">{member.email || 'No email'}</p>
            <p className="text-xs text-gray-500">
              Joined {new Date(member.joined_at).toLocaleDateString()}
              {member.invited_by_name && ` • Invited by ${member.invited_by_name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canManageMembers ?  (
            <select
              value={member.role}
              onChange={(e) => updateMemberRole(member.member_id, e.target.value)}  // Changed
              className={`px-4 py-2 rounded-lg text-sm font-medium ${roleColor} border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer`}
            >
              <option value="viewer">Viewer</option>
              <option value="accountant">Accountant</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          ) : (
            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${roleColor} flex items-center gap-2`}>
              <RoleIcon className="h-4 w-4" />
              {member.role. charAt(0).toUpperCase() + member.role.slice(1)}
            </span>
          )}

          {canManageMembers && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeMember(member.member_id, member.user_id)}  // Changed
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Remove member"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  })}
</div>

        {! canManageMembers && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You don't have permission to manage members.  Contact an admin or owner for assistance.
            </p>
          </div>
        )}

        {members.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No members found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}