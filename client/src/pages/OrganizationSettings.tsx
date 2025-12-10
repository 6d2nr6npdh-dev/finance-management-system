import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, UserPlus, Shield, Eye, Calculator, Building2, Plus, Tag, Folder } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(['owner', 'admin', 'accountant', 'viewer']),
});

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  type: z.enum(['income', 'expense', 'transfer']),
  parent_id: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;

interface Member {
  member_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  full_name: string;
  email: string;
  avatar_url:  string | null;
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

interface Category {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
  parent_name: string | null;
  icon: string | null;
  color: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  transaction_count: number;
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

const categoryColorOptions = [
  { value: "bg-red-500", label: "Red" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value:  "bg-green-500", label: "Green" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-pink-500", label: "Pink" },
];

const categoryIconOptions = [
  "📊", "💰", "🏠", "🚗", "🍔", "⚡", "📱", "🎓", 
  "🏥", "✈️", "🎬", "👔", "🛒", "💼", "🎮", "📚"
];

function AddCategoryDialog({
  orgId,
  categories,
  onCategoryAdded,
}:  {
  orgId: string;
  categories: Category[];
  onCategoryAdded: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: "expense",
      color: "bg-blue-500",
    },
  });

  const selectedType = watch("type");
  const selectedColor = watch("color");
  const selectedIcon = watch("icon");

  const onSubmit = async (values: CategoryFormData) => {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase. rpc("create_category", {
        p_organization_id: orgId,
        p_name: values. name,
        p_type:  values.type,
        p_parent_id: values.parent_id || null,
        p_icon:  values.icon || null,
        p_color:  values.color || "bg-blue-500",
      });

      if (error) {
        console.error("Error creating category:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Category Created",
        description: `${values.name} has been added successfully.`,
      });

      setOpen(false);
      reset();
      onCategoryAdded();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category for organizing transactions
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {/* Category Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Office Supplies"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors. name.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                onValueChange={(value) => setValue("type", value as any)}
                defaultValue="expense"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Parent Category (Optional) */}
            {/* Parent Category (Optional) */}
<div className="grid gap-2">
  <Label htmlFor="parent_id">Parent Category (Optional)</Label>
  <Select onValueChange={(value) => {
    if (value === "none") {
      setValue("parent_id", undefined);
    } else {
      setValue("parent_id", value);
    }
  }}>
    <SelectTrigger>
      <SelectValue placeholder="None (Top-level category)" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">None (Top-level category)</SelectItem>
      {categories
        .filter((cat) => cat.type === selectedType && !cat.parent_id)
        .map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.icon} {category.name}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
  <p className="text-xs text-gray-500">
    Create subcategories by selecting a parent
  </p>
</div>

            {/* Icon Selection */}
            <div className="grid gap-2">
              <Label>Icon</Label>
              <div className="flex gap-2 flex-wrap">
                {categoryIconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setValue("icon", icon)}
                    className={cn(
                      "w-10 h-10 rounded-md border-2 transition-all text-xl flex items-center justify-center",
                      selectedIcon === icon
                        ? "border-primary bg-primary/10 scale-110"
                        : "border-gray-300 hover: border-gray-400"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {categoryColorOptions. map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setValue("color", colorOption.value)}
                    className={cn(
                      "w-10 h-10 rounded-md border-2 transition-all",
                      colorOption.value,
                      selectedColor === colorOption.value
                        ? "border-gray-900 scale-110"
                        : "border-gray-300"
                    )}
                    title={colorOption.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OrganizationSettings() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/org/:orgId/organization-settings");
  const orgId = params?.orgId;
  const { toast } = useToast();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InviteFormData>({
    resolver:  zodResolver(inviteSchema),
    defaultValues: {
      role: "viewer",
    },
  });

  useEffect(() => {
    if (!orgId) {
      console.log("No orgId, redirecting.. .");
      return;
    }

    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (! user) {
        console.log("No user, redirecting to login");
        setLocation("/");
        return;
      }

      console.log("Loading data for org:", orgId, "user:", user.id);

      // Load organization details
      const { data: orgData, error:  orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
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
        .from("organization_members")
        .select("role")
        .eq("organization_id", orgId)
        .eq("user_id", user. id)
        .single();

      console.log("User role data:", roleData, "error:", roleError);
      setCurrentUserRole(roleData?. role || null);

      // Load all members and categories
      await Promise.all([loadMembers(), loadCategories()]);
      setIsLoading(false);
    };

    loadData();
  }, [orgId, setLocation]);

  const loadMembers = async () => {
    if (!orgId) return;

    console.log("Loading members for org:", orgId);

    const { data: membersData, error:  membersError } = await supabase. rpc(
      "get_organization_members",
      {
        p_organization_id: orgId,
      }
    );

    console.log("Members data from function:", membersData);
    console.log("Members error:", membersError);

    if (membersError) {
      console.error("Error loading members:", membersError);
      return;
    }

    if (! membersData || membersData.length === 0) {
      console.warn("No members found in database");
      setMembers([]);
      return;
    }

    setMembers(membersData);
  };

  const loadCategories = async () => {
    if (!orgId) return;

    const { data, error } = await supabase. rpc("get_organization_categories_detailed", {
      p_organization_id: orgId,
    });

    if (error) {
      console.error("Error loading categories:", error);
      return;
    }

    setCategories(data || []);
  };

  const onInviteMember = async (values: InviteFormData) => {
    setInviteError(null);

    try {
      const {
        data: { user },
      } = await supabase. auth.getUser();

      if (!user || ! orgId) {
        setInviteError("Authentication error");
        return;
      }

      const { data, error } = await supabase. rpc("invite_organization_member", {
        p_organization_id: orgId,
        p_email: values.email,
        p_role: values.role,
      });

      if (error) {
        setInviteError(error.message);
        return;
      }

      await loadMembers();
      setIsInviteDialogOpen(false);
      reset();
      toast({ title: "Member Invited", description: "Team member has been added." });
    } catch (err) {
      console.error("Error inviting member:", err);
      setInviteError("An unexpected error occurred");
    }
  };

  const removeMember = async (memberId: string, memberUserId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    const {
      data: { user },
    } = await supabase. auth.getUser();

    if (!user) return;

    if (memberUserId === user.id) {
      const owners = members.filter((m) => m.role === "owner");
      if (owners.length === 1) {
        alert("Cannot remove the last owner.  Please transfer ownership first.");
        return;
      }
    }

    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member:  " + error. message,
        variant: "destructive",
      });
      return;
    }

    await loadMembers();
    toast({ title: "Member Removed", description: "Team member has been removed." });
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    const { error } = await supabase
      .from("organization_members")
      .update({ role: newRole })
      .eq("id", memberId);

    if (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role: " + error.message,
        variant: "destructive",
      });
      return;
    }

    await loadMembers();
    toast({ title: "Role Updated", description: "Member role has been changed." });
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    const { error } = await supabase.rpc("delete_category", {
      p_category_id: categoryId,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await loadCategories();
    toast({ title: "Category Deleted", description: "Category has been removed." });
  };

  if (isLoading) {
    return (
      <Layout
        title="Organization Settings"
        description="Manage organization settings and members"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  const canManageMembers = currentUserRole === "owner" || currentUserRole === "admin";
  const canManageCategories =
    currentUserRole === "owner" ||
    currentUserRole === "admin" ||
    currentUserRole === "accountant";

  return (
    <Layout
      title="Organization Settings"
      description={`Manage ${organization?.name || "organization"} settings and members`}
    >
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Organization Information</h2>
                <p className="text-sm text-gray-600">
                  General settings for this organization
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Organization Name
                </label>
                <p className="text-base font-medium">{organization?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Slug</label>
                <p className="text-base font-mono text-sm bg-gray-50 px-3 py-1 rounded">
                  {organization?.slug}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Currency
                </label>
                <p className="text-base">{organization?.currency}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Timezone
                </label>
                <p className="text-base">{organization?.timezone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Fiscal Year Start
                </label>
                <p className="text-base">
                  {new Date(
                    2024,
                    (organization?.fiscal_year_start || 1) - 1,
                    1
                  ).toLocaleString("default", { month: "long" })}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Team Members</h2>
                <p className="text-sm text-gray-600">
                  {members.length} member(s) in this organization
                </p>
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
                        Add a new member to {organization?.name}.  They must already have
                        an account. 
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onInviteMember)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="colleague@example.com"
                          {... register("email")}
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.email. message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <select
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          {...register("role")}
                        >
                          <option value="viewer">Viewer - Read-only access</option>
                          <option value="accountant">
                            Accountant - Manage finances
                          </option>
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
                          {isSubmitting ? "Inviting..." :  "Invite Member"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="space-y-3">
              {members.map((member) => {
                const RoleIcon =
                  roleIcons[member.role as keyof typeof roleIcons] || Eye;
                const roleColor =
                  roleColors[member. role as keyof typeof roleColors] ||
                  roleColors.viewer;

                return (
                  <div
                    key={member.member_id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <span className="text-base font-semibold text-primary">
                            {member.full_name?. substring(0, 2).toUpperCase() || "?? "}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-base">
                          {member.full_name || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {member.email || "No email"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                          {member.invited_by_name &&
                            ` • Invited by ${member.invited_by_name}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {canManageMembers ?  (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            updateMemberRole(member.member_id, e. target.value)
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${roleColor} border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="accountant">Accountant</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      ) : (
                        <span
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${roleColor} flex items-center gap-2`}
                        >
                          <RoleIcon className="h-4 w-4" />
                          {member.role. charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      )}

                      {canManageMembers && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMember(member.member_id, member.user_id)}
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
                  <strong>Note:</strong> You don't have permission to manage members. 
                  Contact an admin or owner for assistance.
                </p>
              </div>
            )}

            {members.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No members found</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Categories</h2>
                <p className="text-sm text-gray-600">
                  {categories.length} categor{categories.length !== 1 ?  "ies" : "y"}
                </p>
              </div>
              {canManageCategories && orgId && (
                <AddCategoryDialog
                  orgId={orgId}
                  categories={categories}
                  onCategoryAdded={loadCategories}
                />
              )}
            </div>

            {categories.length === 0 ?  (
              <div className="text-center py-12">
                <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                <p className="text-gray-600 mb-4">
                  Create categories to organize your transactions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Income Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                    <span className="text-green-600">↓</span> Income Categories
                  </h3>
                  <div className="space-y-2">
                    {categories
                      .filter((cat) => cat.type === "income")
                      .map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg",
                                category.color || "bg-blue-500"
                              )}
                            >
                              {category.icon || "📊"}
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              {category.parent_name && (
                                <p className="text-xs text-gray-500">
                                  <Folder className="w-3 h-3 inline mr-1" />
                                  {category.parent_name}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {category.transaction_count} transaction
                                {category.transaction_count !== 1 ?  "s" : ""}
                                {category.is_system && (
                                  <span className="ml-2 text-blue-600">• System</span>
                                )}
                              </p>
                            </div>
                          </div>
                          {canManageCategories && ! category.is_system && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCategory(category.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Expense Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                    <span className="text-red-600">↑</span> Expense Categories
                  </h3>
                  <div className="space-y-2">
                    {categories
                      .filter((cat) => cat.type === "expense")
                      .map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg",
                                category.color || "bg-blue-500"
                              )}
                            >
                              {category.icon || "📊"}
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              {category.parent_name && (
                                <p className="text-xs text-gray-500">
                                  <Folder className="w-3 h-3 inline mr-1" />
                                  {category. parent_name}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {category.transaction_count} transaction
                                {category.transaction_count !== 1 ? "s" : ""}
                                {category.is_system && (
                                  <span className="ml-2 text-blue-600">• System</span>
                                )}
                              </p>
                            </div>
                          </div>
                          {canManageCategories && ! category.is_system && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCategory(category.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Transfer Categories */}
                {categories.some((cat) => cat.type === "transfer") && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                      <span className="text-blue-600">⇄</span> Transfer Categories
                    </h3>
                    <div className="space-y-2">
                      {categories
                        .filter((cat) => cat.type === "transfer")
                        .map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg",
                                  category.color || "bg-blue-500"
                                )}
                              >
                                {category.icon || "📊"}
                              </div>
                              <div>
                                <p className="font-medium">{category.name}</p>
                                {category.parent_name && (
                                  <p className="text-xs text-gray-500">
                                    <Folder className="w-3 h-3 inline mr-1" />
                                    {category.parent_name}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  {category.transaction_count} transaction
                                  {category.transaction_count !== 1 ? "s" : ""}
                                  {category. is_system && (
                                    <span className="ml-2 text-blue-600">• System</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            {canManageCategories && !category. is_system && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteCategory(category.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!canManageCategories && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You don't have permission to manage categories. 
                  Contact an admin, owner, or accountant for assistance.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}