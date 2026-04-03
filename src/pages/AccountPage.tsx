import { useAuth } from "@/context/AuthContext";
import { Mail, Shield, Calendar, User } from "lucide-react";

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) return null;

  const infoItems = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Shield, label: "Role", value: user.role },
    {
      icon: Calendar,
      label: "Member since",
      value: new Date(user.createdAt).toLocaleDateString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 sm:p-8">
      <div className="mx-auto max-w-lg">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Account Info</h2>

        {/* Profile card */}
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
          <img
            src={user.profilePic || "/placeholder.svg"}
            alt="Profile"
            className="h-20 w-20 rounded-full border-2 border-primary object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <h3 className="mt-4 text-xl font-bold text-foreground">{user.username}</h3>
          <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {user.role}
          </span>
        </div>

        {/* Details */}
        <div className="mt-6 space-y-3">
          {infoItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
