import { mountAppRoot } from "beams/ax-react/mount-app-root";
import catalog from "./unit-inventories.json";

const showcaseEntries = Object.values(catalog)
  .filter((item) => item.originalPageUrl.startsWith("https://"))
  .map((item) => {
    return {
      name: item.name,
      catalogKey: item.catalogKey,
      thumbnailUrl: item.originalPageUrl.replace(
        "/index.html",
        "/unit-thumbnail.png",
      ),
    };
  });

const PageRoot = () => {
  return (
    <div className="w-dvw h-dvh flex-c">
      <div className="flex-h gap-4 flex-wrap justify-center">
        {showcaseEntries.map((entry) => (
          <div key={entry.catalogKey} className="flex-v gap-2">
            <div className="w-[200px] h-[150px] bg-gray-300">
              <img
                src={entry.thumbnailUrl}
                alt={entry.catalogKey}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center text-sm w-[200px]">{entry.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  return <PageRoot />;
};

mountAppRoot(<App />);
