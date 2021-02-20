import React from 'react';

import {ToastManager, showToast} from './components/ToastManager';

export default function App() {
  const text = `The natural breeding grounds of Atlantic salmon are rivers in Europe and the northeastern coast of North America. In Europe, Atlantic salmon are still found as far south as Spain, and as far north as Russia.[citation needed] Because of sport-fishing, some of the species' southern populations in northern Spain are growing smaller.[9] The species distribution is easily influenced by changes in freshwater habitat and climate. Atlantic salmon are a cold-water fish species and are particularly sensitive to changes in water temperature.[citation needed]
The Housatonic River, and its Naugatuck River tributary, hosted the southernmost Atlantic salmon spawning runs in the United States.[10][11] However, there is a 1609 account by Henry Hudson that Atlantic salmon once ran up the Hudson River.[12] In addition, fish scale evidence dating to 10,000 years BP places Atlantic salmon in a coastal New Jersey pond.[13]
In two publications from 1988 and 1996, Carlson questioned the notion that Atlantic salmon were prehistorically abundant in New England, when the climate was warmer as it is now. Her argument was furthermore based on a paucity of bone data in archaeological sites relative to other fish species, and that historical claims may have been exaggerated.[14][15] This argument was later challenged in another paper which claimed that lack of archaeological bone fragments could be explained by salmon bones being rare at sites that still have large salmon runs and that salmonid bones in general are poorly recovered relative to other fish species.[16][17]
Atlantic salmon populations were significantly reduced in the United States following European settlement. The fur trade, timber harvesting, dams and mills and agriculture degraded freshwater habitats and lowered the carrying capacity of most North American streams. Beaver populations were trapped to near-extinction by 1800, and log drives and clear-cutting further exacerbated stream erosion and habitat loss. As timber and fur gave way to agriculture, freshwater Atlantic salmon habitat was further compromised. According to historian D.W. Dunfield (1985) "over half of the historical Atlantic salmon runs had been lost in North America by 1850". In the Gulf Region of Nova Scotia it was reported that 31 of the 33 Atlantic salmon streams were blocked off by lumber dams, leading to the extirpation of early-run fish in many watersheds. The inshore Atlantic salmon fishery became a major export of the New World, with major fishing operations establishing along the shores of major river systems. The southernmost populations were the first to disappear.[citation needed]
Young salmon spend one to four years in their natal river. When they are large enough (c. 15 centimetres (5.9 in)), they smoltify, changing camouflage from stream-adapted with large, gray spots to sea-adapted with shiny sides. They also undergo some endocrinological changes to adapt to osmotic differences between fresh water and seawater habitat. When smoltification is complete, the parr (young fish) now begin to swim with the current instead of against it. With this behavioral change, the fish are now referred to as smolt. When the smolt reach the sea, they follow sea surface currents and feed on plankton or fry from other fish species such as herring. During their time at sea, they can sense the change in the Earth magnetic field through iron in their lateral line.[citation needed]
When they have had a year of good growth, they will move to the sea surface currents that transport them back to their natal river. It is a major misconception that salmon swim thousands of kilometres at sea; instead they surf through sea surface currents.[citation needed] It is possible they find their natal river by smell, although this is not confirmed;[18] only 5% of Atlantic salmon go up the wrong river.[citation needed] The range of an individual Atlantic salmon can thus be the river where they are born and the sea surface currents that are connected to that river in a circular path.[citation needed]
Wild salmon disappeared from many rivers during the twentieth century due to overfishing and habitat change.[18]`.split(
    /\s*\n+\s*/,
  );

  return (
    <div className='App'>
      <button
        onClick={(e) => {
          e.preventDefault();
          showToast(text[Math.floor(Math.random() * text.length)].substr(0, 120));
        }}
      >
        Show Toast
      </button>
      <ToastManager />
    </div>
  );
}
