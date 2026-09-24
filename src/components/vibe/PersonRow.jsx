import { Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function PersonRow({ profile }) {
  return (
    <Link to={`/user/${profile.user_id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors">
      <Avatar name={profile.full_name} />
      <div className="min-w-0">
        <p className="font-semibold text-[15px] truncate">{profile.full_name}</p>
        <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
      </div>
    </Link>
  );
}