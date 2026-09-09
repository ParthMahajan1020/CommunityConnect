import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function MatchCard({ donor }) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl">
      <CardContent className="p-6">

        <h2 className="text-2xl font-bold">
          {donor.userId.name}
        </h2>

        <p className="mt-3">
          <strong>Blood Group:</strong> {donor.bloodGroup}
        </p>

        <p>
          <strong>Location:</strong> {donor.location}
        </p>

        <p>
          <strong>Contact:</strong> {donor.contact}
        </p>

        <Button className="mt-6 w-full">
          Connect
        </Button>

      </CardContent>
    </Card>
  );
}

export default MatchCard;