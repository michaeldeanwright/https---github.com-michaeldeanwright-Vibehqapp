export default function Avatar({ name = "", size = "md" }) {
  const initials = name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "V";
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-20 h-20 text-2xl" };
  return (
    <div className={`${sizes[size]} shrink-0 rounded-full vibe-gradient flex items-center justify-center text-white font-semibold tracking-wide`}>
      {initials}
    </div>
  );
}