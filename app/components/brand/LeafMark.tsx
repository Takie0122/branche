/** Branche の葉モチーフ（装飾専用・機能なし） */
export default function LeafMark({
  className = "h-5 w-5",
  filled = true,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 24 24">
      {filled ? (
        <>
          <path
            className="fill-current"
            d="M12.2 3.2c4.8 1.1 8.1 5.6 7.6 10.6-.4 4.2-3.6 7.5-7.6 8.2-4.1-.6-7.4-4-7.8-8.3-.5-4.9 2.7-9.3 7.8-10.5Z"
            opacity={0.92}
          />
          <path
            className="stroke-current"
            d="M12.1 4.2c.2 4.8.1 9.2-.2 13.8M12 8.2c2.4 1.4 4.1 3.6 4.6 6.1M12 10.4c-2.2 1.2-3.7 3.2-4.2 5.4"
            opacity={0.55}
            strokeLinecap="round"
            strokeWidth={1.35}
          />
        </>
      ) : (
        <path
          className="stroke-current"
          d="M12.2 3.4c4.6 1 7.8 5.3 7.4 10.1-.4 4-3.5 7.2-7.4 7.9-4-.6-7.1-3.8-7.5-7.9-.5-4.7 2.6-8.9 7.5-10.1Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.7}
        />
      )}
    </svg>
  );
}
