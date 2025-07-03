// UseSession Bookmarklet Code
// Copy and paste this into your browser console on a UseSession client detail page

(function(){
  // Try to extract client information from the page
  const name = document.querySelector('h2')?.innerText?.trim() || 
               document.querySelector('h1')?.innerText?.trim() || 
               document.querySelector('[data-testid="client-name"]')?.innerText?.trim() || '';
  
  const email = document.querySelector('a[href^="mailto:"]')?.innerText?.trim() || 
                document.querySelector('input[type="email"]')?.value?.trim() || '';
  
  const phone = document.querySelector('a[href^="tel:"]')?.innerText?.trim() || 
                document.querySelector('input[type="tel"]')?.value?.trim() || 
                document.querySelector('[href*="tel:"]')?.innerText?.trim() || '';
  
  // Look for session information - try multiple selectors
  const sessionBlock = [...document.querySelectorAll('section, div, .session-info')].find(s => 
    s.innerText && (s.innerText.includes('Mini') || s.innerText.includes('Session') || s.innerText.includes('Shoot'))
  );
  
  let sessionTitle = '';
  let sessionTime = '';
  
  if (sessionBlock) {
    const sessionText = sessionBlock.innerText.split('|');
    sessionTitle = sessionText[0]?.trim() || '';
    sessionTime = sessionText[1]?.trim() || '';
  }
  
  // Fallback: look for any text that might be session info
  if (!sessionTitle) {
    const allText = [...document.querySelectorAll('*')].map(el => el.innerText).join(' ');
    const sessionMatch = allText.match(/(Mini|Session|Shoot|Portrait|Wedding|Family|Maternity|Newborn|Senior|Engagement|Couples|Headshot|Pet|Commercial|Event|Birthday|Anniversary|Holiday|Spring|Summer|Fall|Winter|Watermelon|Christmas|Halloween|Valentine|Easter|Graduation|Beach|Studio|Outdoor|Indoor|Lifestyle|Fashion|Business|Corporate|Real Estate|Architecture|Product|Food|Travel|Nature|Landscape|Sports|Fitness|Dance|Music|Art|Creative|Fun|Cute|Beautiful|Elegant|Rustic|Modern|Classic|Vintage|Boho|Urban|Country|Glamour|Casual|Formal|Themed|Custom|Special|Unique|Memorable|Amazing|Perfect|Dream|Magic|Love|Joy|Happiness|Celebration|Milestone|Moment|Memory|Capture|Story|Journey|Adventure|Experience|Life|Family|Friends|Together|Forever|Always|Once|Lifetime|Year|Season|Month|Week|Day|Time|Hour|Minute|Second|Now|Today|Tomorrow|Yesterday|Soon|Later|Early|Late|Morning|Afternoon|Evening|Night|Dawn|Dusk|Sunrise|Sunset|Golden|Blue|Magic|Prime|Rush|Quiet|Peaceful|Busy|Hectic|Calm|Relaxed|Excited|Nervous|Happy|Sad|Angry|Surprised|Confused|Tired|Energetic|Motivated|Inspired|Creative|Productive|Successful|Accomplished|Proud|Grateful|Thankful|Blessed|Lucky|Fortunate|Hopeful|Optimistic|Positive|Negative|Neutral|Balanced|Centered|Focused|Determined|Confident|Brave|Courageous|Strong|Weak|Vulnerable|Sensitive|Caring|Loving|Kind|Gentle|Sweet|Cute|Adorable|Beautiful|Gorgeous|Stunning|Amazing|Incredible|Fantastic|Wonderful|Marvelous|Spectacular|Outstanding|Excellent|Great|Good|Okay|Average|Bad|Terrible|Awful|Horrible|Disgusting|Revolting|Repulsive|Offensive|Inappropriate|Unacceptable|Unforgivable|Inexcusable|Intolerable|Unbearable|Overwhelming|Underwhelming|Disappointing|Satisfying|Fulfilling|Rewarding|Worthwhile|Valuable|Precious|Priceless|Important|Significant|Meaningful|Memorable|Unforgettable|Remarkable|Notable|Noteworthy|Interesting|Fascinating|Intriguing|Curious|Strange|Weird|Odd|Unusual|Unique|Special|Different|Similar|Same|Identical|Equal|Equivalent|Comparable|Relative|Absolute|Certain|Uncertain|Sure|Unsure|Confident|Doubtful|Skeptical|Trusting|Trustworthy|Reliable|Dependable|Consistent|Inconsistent|Stable|Unstable|Steady|Unsteady|Solid|Liquid|Gas|Plasma|Matter|Energy|Force|Power|Strength|Weakness|Ability|Capability|Capacity|Potential|Possibility|Probability|Certainty|Uncertainty|Risk|Safety|Security|Danger|Threat|Opportunity|Challenge|Problem|Solution|Answer|Question|Issue|Concern|Worry|Fear|Anxiety|Stress|Pressure|Tension|Relaxation|Relief|Comfort|Discomfort|Pain|Pleasure|Happiness|Sadness|Joy|Sorrow|Anger|Calm|Peace|War|Conflict|Harmony|Balance|Imbalance|Order|Chaos|Structure|Organization|Disorganization|System|Process|Method|Approach|Strategy|Plan|Goal|Objective|Target|Aim|Purpose|Intention|Motivation|Inspiration|Influence|Impact|Effect|Cause|Result|Consequence|Outcome|Success|Failure|Achievement|Accomplishment|Progress|Improvement|Development|Growth|Change|Transformation|Evolution|Revolution|Innovation|Invention|Discovery|Exploration|Investigation|Research|Study|Learning|Education|Teaching|Instruction|Training|Practice|Exercise|Activity|Action|Behavior|Conduct|Performance|Function|Operation|Work|Job|Task|Duty|Responsibility|Obligation|Commitment|Promise|Agreement|Contract|Deal|Arrangement|Plan|Schedule|Appointment|Meeting|Event|Occasion|Celebration|Party|Gathering|Assembly|Conference|Convention|Workshop|Seminar|Class|Course|Lesson|Session|Tutorial|Demonstration|Presentation|Performance|Show|Display|Exhibition|Fair|Festival|Competition|Contest|Tournament|Game|Sport|Recreation|Entertainment|Fun|Amusement|Enjoyment|Pleasure|Satisfaction|Fulfillment|Contentment|Happiness|Joy|Delight|Bliss|Ecstasy|Euphoria|Excitement|Thrill|Adventure|Experience|Journey|Trip|Travel|Vacation|Holiday|Break|Rest|Relaxation|Leisure|Free|Time|Space|Place|Location|Position|Spot|Area|Region|Zone|Territory|Land|Country|State|City|Town|Village|Neighborhood|Community|Society|Culture|Tradition|Custom|Habit|Routine|Pattern|Trend|Fashion|Style|Design|Art|Creativity|Imagination|Fantasy|Dream|Vision|Idea|Concept|Thought|Mind|Brain|Intelligence|Wisdom|Knowledge|Information|Data|Facts|Truth|Reality|Fiction|Story|Tale|Narrative|Account|Report|Description|Explanation|Clarification|Understanding|Comprehension|Awareness|Consciousness|Perception|Sensation|Feeling|Emotion|Mood|Attitude|Opinion|Belief|Faith|Trust|Hope|Expectation|Anticipation|Prediction|Forecast|Estimate|Guess|Assumption|Supposition|Hypothesis|Theory|Law|Rule|Principle|Standard|Norm|Average|Typical|Normal|Regular|Common|Usual|Ordinary|Extraordinary|Special|Unique|Rare|Uncommon|Unusual|Strange|Weird|Odd|Funny|Hilarious|Amusing|Entertaining|Interesting|Boring|Dull|Monotonous|Repetitive|Redundant|Unnecessary|Essential|Important|Significant|Meaningful|Valuable|Worthwhile|Useful|Helpful|Beneficial|Advantageous|Profitable|Lucrative|Expensive|Cheap|Affordable|Free|Costly|Pricey|Reasonable|Fair|Unfair|Just|Unjust|Right|Wrong|Correct|Incorrect|Accurate|Inaccurate|Precise|Imprecise|Exact|Approximate|Close|Near|Far|Distant|Remote|Local|Global|Universal|General|Specific|Particular|Individual|Personal|Private|Public|Open|Closed|Locked|Unlocked|Secure|Insecure|Safe|Unsafe|Dangerous|Risky|Cautious|Careful|Careless|Reckless|Responsible|Irresponsible|Mature|Immature|Adult|Child|Young|Old|New|Fresh|Stale|Old|Ancient|Modern|Contemporary|Current|Recent|Past|Future|Present|Now|Then|When|Where|How|Why|What|Who|Which|Whose|Whom|That|This|These|Those|Here|There|Everywhere|Nowhere|Somewhere|Anywhere|Always|Never|Sometimes|Often|Rarely|Seldom|Frequently|Occasionally|Usually|Normally|Typically|Generally|Specifically|Particularly|Especially|Mainly|Mostly|Primarily|Basically|Essentially|Fundamentally|Ultimately|Finally|Eventually|Soon|Later|Earlier|Before|After|During|While|Until|Since|From|To|In|On|At|By|With|Without|For|Against|About|Around|Through|Over|Under|Above|Below|Between|Among|Within|Outside|Inside|Beside|Next|Near|Far|Close|Away|Up|Down|Left|Right|Forward|Backward|Ahead|Behind|Front|Back|Top|Bottom|Side|Middle|Center|Edge|Corner|End|Beginning|Start|Finish|Complete|Incomplete|Partial|Full|Empty|Half|Quarter|Third|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Hundred|Thousand|Million|Billion|Trillion|Infinity|Zero|One|Single|Double|Triple|Multiple|Many|Few|Several|Some|All|None|Every|Each|Both|Either|Neither|Or|And|But|However|Although|Though|Despite|In|Of|To|From|By|With|Without|For|Against|About|Around|Through|Over|Under|Above|Below|Between|Among|Within|Outside|Inside|Beside|Next|Near|Far|Close|Away|Up|Down|Left|Right|Forward|Backward|Ahead|Behind|Front|Back|Top|Bottom|Side|Middle|Center|Edge|Corner|End|Beginning|Start|Finish) (Truck|Mini|Session|Shoot)/i);
    if (sessionMatch) {
      sessionTitle = sessionMatch[0];
    }
  }
  
  // Try to find date/time information
  if (!sessionTime) {
    const dateElements = [...document.querySelectorAll('*')].filter(el => {
      const text = el.innerText;
      return text && (
        text.match(/\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)\b/) ||
        text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/) ||
        text.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/) ||
        text.match(/\b\d{4}-\d{2}-\d{2}\b/)
      );
    });
    
    if (dateElements.length > 0) {
      sessionTime = dateElements[0].innerText.trim();
    }
  }
  
  // Clean up the extracted data
  const cleanData = {
    name: name.replace(/[^\w\s.-]/g, '').trim(),
    email: email.replace(/mailto:/, '').trim(),
    phone: phone.replace(/tel:/, '').trim(),
    sessionTitle: sessionTitle.replace(/[^\w\s.-]/g, '').trim(),
    sessionTime: sessionTime.replace(/[^\w\s.,-:]/g, '').trim()
  };
  
  // Build the URL parameters
  const params = new URLSearchParams();
  Object.entries(cleanData).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  
  // Get the current domain or use localhost for development
  const baseUrl = window.location.hostname === 'localhost' ? 
    'http://localhost:3000' : 
    'https://sessionremind.com';
  
  const targetUrl = `${baseUrl}/new?${params.toString()}`;
  
  // Log the extracted data for debugging
  console.log('Extracted data:', cleanData);
  console.log('Target URL:', targetUrl);
  
  // Open the new window
  window.open(targetUrl, '_blank');
  
  // Show a confirmation message
  alert(`Data extracted and sent to Session Reminder!\n\nName: ${cleanData.name}\nPhone: ${cleanData.phone}\nEmail: ${cleanData.email}\nSession: ${cleanData.sessionTitle}\nTime: ${cleanData.sessionTime}`);
})();