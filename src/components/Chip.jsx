import { C } from "../constants/theme";

// Shared pill/chip button.
export default function Chip({ active, onClick, children, color }) {
  return (
    <button onClick={onClick}
      style={{
        padding:"7px 14px", borderRadius:18,
        background: active ? (color||C.gold) : "transparent",
        color: active ? C.bg : C.text,
        border: "1px solid " + (active ? (color||C.gold) : C.borderLight),
        fontSize:13, fontWeight:500, cursor:"pointer", transition:"all 0.15s",
        fontFamily:"Nunito, sans-serif"
      }}>
      {children}
    </button>
  );
}
