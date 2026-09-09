import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SearchForm({ onSearch }) {

    const [bloodGroup, setBloodGroup] = useState("");
    const [location, setLocation] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        onSearch({
            bloodGroup,
            location
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >

            <Input
                placeholder="Blood Group (O+, A+, B+...)"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
            />

            <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />

            <Button
                type="submit"
                className="w-full"
            >
                Search
            </Button>

        </form>
    );
}

export default SearchForm;