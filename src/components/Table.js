export default function Table({ headers, children, className = "" }) {
  return (
    <div className={`w-full overflow-x-auto border border-border rounded-xs bg-card ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b border-border">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="p-4 font-semibold tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm text-foreground">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = "", onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-muted/20 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }) {
  return <td className={`p-4 align-middle whitespace-nowrap ${className}`}>{children}</td>;
}
