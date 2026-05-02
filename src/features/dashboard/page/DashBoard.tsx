import BannerCard from "../components/BannerCard";
import CardList from "../components/CardList";
import { SongTable } from "../../../components/common/SongTable";
const DashBoard = () => {
    return (
        <div className="space-y-6">
            <BannerCard />
            <CardList />
            <SongTable />
        </div>
    );
};

export default DashBoard;
