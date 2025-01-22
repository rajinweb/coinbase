import React from 'react';

interface Match {
  time: string;
  product_id: string;
  size: string;
  price: string;
  side: 'buy' | 'sell';
}

interface MatchViewProps {
  matches: Match[];
  subscriptions: string[];
}

const MatchView: React.FC<MatchViewProps> = ({ matches, subscriptions }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Match View</h2>
      {subscriptions.length === 0 ? (
        <p className="text-gray-500">No active subscriptions</p>
      ) : (
        <div className="overflow-y-auto max-h-96">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="text-left py-2 px-3">Time</th>
                <th className="text-left py-2 px-3">Product</th>
                <th className="text-right py-2 px-3">Size</th>
                <th className="text-right py-2 px-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">
                    {new Date(match.time).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 font-medium">{match.product_id}</td>
                  <td className="text-right py-2 px-3">{match.size}</td>
                  <td
                    className={`text-right py-2 px-3 font-medium ${
                      match.side === 'buy' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {match.price}
                  </td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No matches available for subscribed products
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MatchView;