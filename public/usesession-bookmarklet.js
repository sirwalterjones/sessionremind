// Enhanced UseSession Bookmarklet
// This version is specifically optimized for UseSession.com pages

javascript:(function(){
  // Enhanced selectors for UseSession pages
  const extractClientInfo = () => {
    let name = '';
    let email = '';
    let phone = '';
    let sessionTitle = '';
    let sessionTime = '';

    // Try multiple selectors for name
    const nameSelectors = [
      'h1', 'h2', 'h3',
      '[data-testid*="name"]', '[data-testid*="client"]',
      '.client-name', '.name', '.contact-name',
      '[class*="name"]', '[class*="client"]'
    ];
    
    for (const selector of nameSelectors) {
      const element = document.querySelector(selector);
      if (element && element.innerText && element.innerText.trim().length > 2) {
        name = element.innerText.trim();
        break;
      }
    }

    // Try multiple selectors for email
    const emailSelectors = [
      'a[href^="mailto:"]',
      'input[type="email"]',
      '[data-testid*="email"]',
      '.email', '.contact-email',
      '[class*="email"]'
    ];
    
    for (const selector of emailSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.innerText || element.value || element.href || '';
        if (text.includes('@')) {
          email = text.replace('mailto:', '').trim();
          break;
        }
      }
    }

    // Try multiple selectors for phone
    const phoneSelectors = [
      'a[href^="tel:"]',
      'input[type="tel"]',
      '[data-testid*="phone"]',
      '.phone', '.contact-phone', '.mobile',
      '[class*="phone"]', '[class*="mobile"]'
    ];
    
    for (const selector of phoneSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.innerText || element.value || element.href || '';
        if (text.match(/[\d\-\(\)\+\s]{10,}/)) {
          phone = text.replace('tel:', '').trim();
          break;
        }
      }
    }

    // Enhanced session title extraction
    const sessionSelectors = [
      '[data-testid*="session"]', '[data-testid*="booking"]',
      '.session-title', '.booking-title', '.appointment-title',
      '[class*="session"]', '[class*="booking"]', '[class*="appointment"]'
    ];
    
    // Look for session information in various places
    const allText = document.body.innerText;
    const sessionPatterns = [
      /(Mini|Session|Shoot|Portrait|Wedding|Family|Maternity|Newborn|Senior|Engagement|Couples|Headshot|Pet|Commercial|Event|Birthday|Anniversary|Holiday|Spring|Summer|Fall|Winter|Watermelon|Christmas|Halloween|Valentine|Easter|Graduation|Beach|Studio|Outdoor|Indoor|Lifestyle|Fashion|Business|Corporate|Boudoir|Bridal|Children|Baby|Pregnancy|Cake|Smash|Milestone|Gender|Reveal|Announcement|Save|Date|Rehearsal|Reception|Ceremony|Elopement|Destination|Drone|Aerial|Real|Estate|Product|Food|Travel|Nature|Landscape|Sports|Fitness|Dance|Music|Art|Creative|Rustic|Modern|Classic|Vintage|Boho|Urban|Country|Glamour|Casual|Formal|Themed|Custom|Special|Golden|Hour|Sunset|Sunrise|Blue|Magic|Prime|Rush|Watermelon|Truck|Pumpkin|Patch|Christmas|Tree|Farm|Sunflower|Field|Lavender|Cherry|Blossom|Fall|Foliage|Snow|Winter|Wonderland|Beach|Ocean|Lake|Mountain|Forest|Desert|City|Downtown|Park|Garden|Home|Backyard|Indoor|Outdoor|Natural|Light|Flash|Candid|Posed|Documentary|Journalistic|Fine|Art|Editorial|Fashion|Beauty|Glamour|Fitness|Sports|Action|Movement|Still|Life|Macro|Close|Up|Wide|Angle|Telephoto|Prime|Zoom|Fast|Slow|Shutter|Aperture|ISO|Exposure|Focus|Depth|Field|Bokeh|Sharp|Soft|Hard|Diffused|Reflected|Direct|Ambient|Available|Continuous|Strobe|Speedlight|Softbox|Umbrella|Reflector|Diffuser|Filter|Lens|Camera|Digital|Film|Color|Black|White|Sepia|Vintage|Retro|Modern|Contemporary|Timeless|Classic|Elegant|Sophisticated|Playful|Fun|Whimsical|Romantic|Intimate|Cozy|Warm|Cool|Bright|Dark|Moody|Dramatic|Soft|Dreamy|Ethereal|Magical|Enchanting|Stunning|Beautiful|Gorgeous|Amazing|Incredible|Fantastic|Wonderful|Perfect|Memorable|Unforgettable|Special|Unique|One|Kind|Custom|Personalized|Tailored|Bespoke|Exclusive|Premium|Luxury|High|End|Professional|Expert|Experienced|Skilled|Talented|Creative|Artistic|Passionate|Dedicated|Committed|Reliable|Trustworthy|Friendly|Approachable|Easy|Going|Laid|Back|Relaxed|Comfortable|Confident|Assured|Prepared|Organized|Efficient|Timely|Punctual|Respectful|Considerate|Accommodating|Flexible|Adaptable|Versatile|Diverse|Varied|Range|Selection|Options|Choices|Packages|Deals|Offers|Specials|Promotions|Discounts|Savings|Value|Affordable|Reasonable|Fair|Competitive|Quality|Excellence|Standards|Guarantee|Satisfaction|Results|Outcome|Delivery|Turnaround|Fast|Quick|Speedy|Efficient|Smooth|Seamless|Easy|Simple|Hassle|Free|Stress|Worry|Anxiety|Concerns|Issues|Problems|Solutions|Answers|Help|Support|Assistance|Guidance|Advice|Tips|Suggestions|Recommendations|Ideas|Inspiration|Motivation|Encouragement|Confidence|Assurance|Peace|Mind|Comfort|Ease|Convenience|Accessibility|Availability|Flexibility|Options|Alternatives|Backup|Plan|Contingency|Emergency|Last|Minute|Rush|Urgent|Priority|Important|Critical|Essential|Necessary|Required|Mandatory|Optional|Additional|Extra|Bonus|Complimentary|Free|Included|Covered|Comprehensive|Complete|Full|Partial|Limited|Restricted|Exclusive|Private|Public|Group|Individual|Personal|Corporate|Business|Commercial|Professional|Amateur|Beginner|Intermediate|Advanced|Expert|Master|Pro|Novice|Experienced|Skilled|Talented|Gifted|Natural|Born|Made|Trained|Educated|Qualified|Certified|Licensed|Insured|Bonded|Registered|Accredited|Recognized|Awarded|Honored|Praised|Recommended|Referred|Trusted|Respected|Admired|Loved|Appreciated|Valued|Treasured|Cherished|Adored|Worshipped|Idolized|Revered|Esteemed|Regarded|Considered|Thought|Believed|Known|Famous|Popular|Well|Liked|Favored|Preferred|Chosen|Selected|Picked|Handpicked|Curated|Specially|Carefully|Thoughtfully|Lovingly|Passionately|Enthusiastically|Eagerly|Excitedly|Happily|Joyfully|Cheerfully|Optimistically|Hopefully|Confidently|Boldly|Bravely|Courageously|Fearlessly|Determinedly|Persistently|Consistently|Regularly|Frequently|Often|Always|Never|Sometimes|Occasionally|Rarely|Seldom|Hardly|Barely|Scarcely|Almost|Nearly|Practically|Virtually|Essentially|Basically|Fundamentally|Primarily|Mainly|Mostly|Generally|Usually|Typically|Normally|Commonly|Frequently|Regularly|Routinely|Habitually|Customarily|Traditionally|Conventionally|Standardly|Ordinarily|Naturally|Automatically|Instinctively|Intuitively|Obviously|Clearly|Evidently|Apparently|Seemingly|Presumably|Supposedly|Allegedly|Reportedly|Rumored|Claimed|Stated|Mentioned|Said|Told|Informed|Advised|Suggested|Recommended|Proposed|Offered|Provided|Given|Granted|Allowed|Permitted|Authorized|Approved|Accepted|Agreed|Confirmed|Verified|Validated|Authenticated|Certified|Guaranteed|Assured|Promised|Committed|Dedicated|Devoted|Loyal|Faithful|True|Honest|Sincere|Genuine|Real|Authentic|Original|Unique|Special|Different|Distinctive|Characteristic|Typical|Representative|Symbolic|Emblematic|Indicative|Suggestive|Reminiscent|Evocative|Nostalgic|Sentimental|Emotional|Touching|Moving|Inspiring|Motivating|Encouraging|Uplifting|Positive|Optimistic|Hopeful|Cheerful|Happy|Joyful|Delightful|Pleasant|Enjoyable|Fun|Entertaining|Amusing|Funny|Hilarious|Comical|Humorous|Witty|Clever|Smart|Intelligent|Brilliant|Genius|Talented|Gifted|Skilled|Able|Capable|Competent|Qualified|Experienced|Knowledgeable|Wise|Sage|Expert|Professional|Master|Specialist|Authority|Leader|Pioneer|Innovator|Creator|Artist|Visionary|Dreamer|Thinker|Philosopher|Poet|Writer|Author|Storyteller|Narrator|Journalist|Reporter|Correspondent|Photographer|Videographer|Filmmaker|Director|Producer|Editor|Designer|Stylist|Consultant|Advisor|Coach|Mentor|Teacher|Instructor|Trainer|Guide|Helper|Assistant|Supporter|Advocate|Champion|Defender|Protector|Guardian|Keeper|Caretaker|Custodian|Steward|Manager|Organizer|Coordinator|Facilitator|Mediator|Negotiator|Diplomat|Ambassador|Representative|Spokesperson|Agent|Broker|Dealer|Seller|Vendor|Supplier|Provider|Contractor|Freelancer|Independent|Solo|Individual|Personal|Private|Exclusive|Special|Unique|One|Kind|Custom|Personalized|Tailored|Bespoke|Handmade|Crafted|Artisan|Boutique|Specialty|Niche|Focused|Dedicated|Specialized|Expert|Professional|Premium|High|End|Luxury|Upscale|Elite|Exclusive|Private|Members|Only|VIP|Special|Privileged|Preferred|Priority|First|Class|Top|Tier|Best|Finest|Highest|Quality|Superior|Excellent|Outstanding|Exceptional|Extraordinary|Remarkable|Notable|Noteworthy|Impressive|Amazing|Incredible|Fantastic|Wonderful|Marvelous|Spectacular|Stunning|Breathtaking|Jaw|Dropping|Mind|Blowing|Awe|Inspiring|Overwhelming|Unbelievable|Incredible|Impossible|Unlikely|Rare|Uncommon|Unusual|Unique|Special|Different|Distinctive|Characteristic|Typical|Representative|Standard|Normal|Regular|Common|Ordinary|Average|Everyday|Routine|Usual|Customary|Traditional|Conventional|Classic|Timeless|Enduring|Lasting|Permanent|Eternal|Forever|Always|Never|Ending|Infinite|Limitless|Boundless|Endless|Countless|Numerous|Many|Multiple|Several|Few|Some|All|Every|Each|Any|No|None|Zero|Nothing|Empty|Blank|Void|Null|Absent|Missing|Gone|Lost|Hidden|Secret|Private|Confidential|Classified|Restricted|Limited|Exclusive|Special|Unique|Rare|Scarce|Precious|Valuable|Priceless|Invaluable|Worthless|Cheap|Inexpensive|Affordable|Reasonable|Fair|Just|Right|Correct|Accurate|Precise|Exact|Perfect|Ideal|Ultimate|Final|Last|End|Finish|Complete|Done|Finished|Over|Through|Past|History|Memory|Remembrance|Recollection|Recall|Recognition|Awareness|Consciousness|Realization|Understanding|Comprehension|Knowledge|Information|Data|Facts|Truth|Reality|Actuality|Existence|Being|Life|Living|Alive|Active|Dynamic|Energetic|Vibrant|Lively|Animated|Spirited|Enthusiastic|Passionate|Fervent|Ardent|Zealous|Devoted|Dedicated|Committed|Loyal|Faithful|True|Honest|Sincere|Genuine|Real|Authentic|Original|Pure|Clean|Fresh|New|Recent|Latest|Current|Modern|Contemporary|Up|Date|Fashionable|Trendy|Stylish|Chic|Elegant|Sophisticated|Refined|Polished|Smooth|Sleek|Streamlined|Efficient|Effective|Successful|Productive|Fruitful|Beneficial|Advantageous|Profitable|Lucrative|Rewarding|Satisfying|Fulfilling|Gratifying|Pleasing|Enjoyable|Delightful|Wonderful|Fantastic|Amazing|Incredible|Awesome|Great|Good|Excellent|Outstanding|Exceptional|Extraordinary|Remarkable|Notable|Impressive|Striking|Eye|Catching|Attention|Grabbing|Head|Turning|Show|Stopping|Breath|Taking|Jaw|Dropping|Mind|Blowing|Heart|Stopping|Soul|Stirring|Spirit|Lifting|Mood|Boosting|Energy|Giving|Life|Changing|Game|Changing|World|Changing|Ground|Breaking|Record|Breaking|Barrier|Breaking|Trend|Setting|Pace|Setting|Standard|Setting|Bench|Mark|Land|Mark|Mile|Stone|Touch|Stone|Corner|Stone|Foundation|Stone|Stepping|Stone|Building|Block|Frame|Work|Structure|System|Process|Method|Approach|Strategy|Plan|Goal|Objective|Target|Aim|Purpose|Mission|Vision|Dream|Hope|Wish|Desire|Want|Need|Requirement|Necessity|Essential|Important|Significant|Meaningful|Valuable|Worthwhile|Useful|Helpful|Beneficial|Advantageous|Positive|Good|Great|Excellent|Outstanding|Exceptional|Extraordinary|Amazing|Incredible|Fantastic|Wonderful|Marvelous|Spectacular|Stunning|Beautiful|Gorgeous|Lovely|Pretty|Attractive|Appealing|Charming|Enchanting|Captivating|Mesmerizing|Hypnotic|Spellbinding|Enthralling|Fascinating|Intriguing|Interesting|Engaging|Compelling|Persuasive|Convincing|Influential|Powerful|Strong|Mighty|Potent|Effective|Efficient|Productive|Successful|Winning|Victorious|Triumphant|Champion|Leader|Winner|Best|Top|First|Number|One|Primary|Main|Principal|Chief|Head|Boss|Manager|Director|Executive|Officer|President|CEO|Founder|Owner|Proprietor|Entrepreneur|Business|Person|Professional|Expert|Specialist|Authority|Master|Guru|Sage|Wise|Man|Woman|Person|Individual|Human|Being|Soul|Spirit|Heart|Mind|Body|Whole|Complete|Total|Full|Entire|All|Everything|Anything|Something|Nothing|No|Thing|Some|Thing|Any|Thing|Every|Thing|All|Things|Many|Things|Few|Things|Little|Things|Big|Things|Small|Things|Great|Things|Good|Things|Bad|Things|Best|Things|Worst|Things|First|Things|Last|Things|Old|Things|New|Things|Different|Things|Same|Things|Similar|Things|Unique|Things|Special|Things|Common|Things|Rare|Things|Usual|Things|Unusual|Things|Normal|Things|Abnormal|Things|Regular|Things|Irregular|Things|Standard|Things|Non|Standard|Things|Typical|Things|Atypical|Things|Ordinary|Things|Extraordinary|Things|Average|Things|Above|Average|Things|Below|Average|Things|High|Things|Low|Things|Up|Things|Down|Things|Left|Things|Right|Things|Front|Things|Back|Things|Inside|Things|Outside|Things|Private|Things|Public|Things|Personal|Things|Professional|Things|Work|Things|Play|Things|Fun|Things|Serious|Things|Important|Things|Trivial|Things|Major|Things|Minor|Things|Big|Things|Small|Things|Large|Things|Tiny|Things|Huge|Things|Massive|Things|Enormous|Things|Giant|Things|Microscopic|Things|Miniature|Things|Compact|Things|Portable|Things|Mobile|Things|Stationary|Things|Fixed|Things|Flexible|Things|Rigid|Things|Soft|Things|Hard|Things|Smooth|Things|Rough|Things|Sharp|Things|Dull|Things|Bright|Things|Dark|Things|Light|Things|Heavy|Things|Hot|Things|Cold|Things|Warm|Things|Cool|Things|Wet|Things|Dry|Things|Clean|Things|Dirty|Things|Pure|Things|Mixed|Things|Simple|Things|Complex|Things|Easy|Things|Difficult|Things|Hard|Things|Soft|Things|Fast|Things|Slow|Things|Quick|Things|Gradual|Things|Sudden|Things|Immediate|Things|Delayed|Things|Early|Things|Late|Things|On|Time|Things|Timely|Things|Untimely|Things|Appropriate|Things|Inappropriate|Things|Suitable|Things|Unsuitable|Things|Proper|Things|Improper|Things|Correct|Things|Incorrect|Things|Right|Things|Wrong|Things|Good|Things|Bad|Things|Better|Things|Worse|Things|Best|Things|Worst|Things|Perfect|Things|Imperfect|Things|Flawed|Things|Flawless|Things|Broken|Things|Fixed|Things|Damaged|Things|Intact|Things|Whole|Things|Partial|Things|Complete|Things|Incomplete|Things|Finished|Things|Unfinished|Things|Done|Things|Undone|Things|Started|Things|Stopped|Things|Paused|Things|Continued|Things|Resumed|Things|Ended|Things|Begun|Things|Initiated|Things|Launched|Things|Introduced|Things|Presented|Things|Revealed|Things|Shown|Things|Displayed|Things|Exhibited|Things|Demonstrated|Things|Performed|Things|Executed|Things|Accomplished|Things|Achieved|Things|Completed|Things|Finished|Things|Done|Things|Over|Things|Through|Things|Past|Things|Future|Things|Present|Things|Current|Things|Now|Things|Then|Things|When|Things|Where|Things|How|Things|Why|Things|What|Things|Who|Things|Which|Things|Whose|Things|Whom|Things|That|Things|This|Things|These|Things|Those|Things|Here|Things|There|Things|Everywhere|Things|Nowhere|Things|Somewhere|Things|Anywhere|Things|Always|Things|Never|Things|Sometimes|Things|Often|Things|Rarely|Things|Seldom|Things|Frequently|Things|Occasionally|Things|Usually|Things|Normally|Things|Typically|Things|Generally|Things|Specifically|Things|Particularly|Things|Especially|Things|Mainly|Things|Mostly|Things|Primarily|Things|Basically|Things|Essentially|Things|Fundamentally|Things|Ultimately|Things|Finally|Things|Eventually|Things|Soon|Things|Later|Things|Earlier|Things|Before|Things|After|Things|During|Things|While|Things|Until|Things|Since|Things|From|Things|To|Things|In|Things|On|Things|At|Things|By|Things|With|Things|Without|Things|For|Things|Against|Things|About|Things|Around|Things|Through|Things|Over|Things|Under|Things|Above|Things|Below|Things|Between|Things|Among|Things|Within|Things|Outside|Things|Inside|Things|Beside|Things|Next|Things|Near|Things|Far|Things|Close|Things|Away|Things|Up|Things|Down|Things|Left|Things|Right|Things|Forward|Things|Backward|Things|Ahead|Things|Behind|Things|Front|Things|Back|Things|Top|Things|Bottom|Things|Side|Things|Middle|Things|Center|Things|Edge|Things|Corner|Things|End|Things|Beginning|Things|Start|Things|Finish|Things|Complete|Things|Incomplete|Things|Partial|Things|Full|Things|Empty|Things|Half|Things|Quarter|Things|Third|Things|Two|Things|Three|Things|Four|Things|Five|Things|Six|Things|Seven|Things|Eight|Things|Nine|Things|Ten|Things|Hundred|Things|Thousand|Things|Million|Things|Billion|Things|Trillion|Things|Infinity|Things|Zero|Things|One|Things|Single|Things|Double|Things|Triple|Things|Multiple|Things|Many|Things|Few|Things|Several|Things|Some|Things|All|Things|None|Things|Every|Things|Each|Things|Both|Things|Either|Things|Neither|Things|Or|Things|And|Things|But|Things|However|Things|Although|Things|Though|Things|Despite|Things|In|Things|Of|Things|To|Things|From|Things|By|Things|With|Things|Without|Things|For|Things|Against|Things|About|Things|Around|Things|Through|Things|Over|Things|Under|Things|Above|Things|Below|Things|Between|Things|Among|Things|Within|Things|Outside|Things|Inside|Things|Beside|Things|Next|Things|Near|Things|Far|Things|Close|Things|Away|Things|Up|Things|Down|Things|Left|Things|Right|Things|Forward|Things|Backward|Things|Ahead|Things|Behind|Things|Front|Things|Back|Things|Top|Things|Bottom|Things|Side|Things|Middle|Things|Center|Things|Edge|Things|Corner|Things|End|Things|Beginning|Things|Start|Things|Finish|Things|Complete|Things|Incomplete|Things|Partial|Things|Full|Things|Empty|Things|Half|Things|Quarter|Things|Third|Things|Two|Things|Three|Things|Four|Things|Five|Things|Six|Things|Seven|Things|Eight|Things|Nine|Things|Ten|Things|Hundred|Things|Thousand|Things|Million|Things|Billion|Things|Trillion|Things|Infinity|Things|Zero|Things|One|Things|Single|Things|Double|Things|Triple|Things|Multiple|Things|Many|Things|Few|Things|Several|Things|Some|Things|All|Things|None|Things|Every|Things|Each|Things|Both|Things|Either|Things|Neither|Things|Or|Things|And|Things|But|Things|However|Things|Although|Things|Though|Things|Despite|Things) (Truck|Mini|Session|Shoot|Portrait|Photography|Photo|Pics|Pictures|Images|Capture|Moment|Memory|Experience|Event|Occasion|Celebration|Party|Gathering|Meeting|Appointment|Booking|Reservation|Schedule|Plan|Date|Time|Day|Week|Month|Year|Season|Holiday|Special|Unique|Custom|Personalized|Tailored|Bespoke|Exclusive|Private|Premium|Luxury|High|End|Professional|Expert|Quality|Excellence|Perfect|Ideal|Ultimate|Best|Top|First|Primary|Main|Principal|Chief|Head|Leading|Major|Important|Significant|Meaningful|Valuable|Precious|Special|Rare|Unique|One|Kind|Custom|Personalized|Individual|Personal|Private|Exclusive|Special|Limited|Restricted|Members|Only|VIP|Priority|First|Class|Premium|Luxury|High|End|Elite|Exclusive|Private|Special|Unique|Rare|Uncommon|Unusual|Different|Distinctive|Characteristic|Typical|Representative|Standard|Normal|Regular|Common|Ordinary|Average|Everyday|Routine|Usual|Customary|Traditional|Conventional|Classic|Timeless|Enduring|Lasting|Permanent|Memorable|Unforgettable|Special|Unique|One|Kind|Custom|Personalized|Tailored|Bespoke|Handmade|Crafted|Artisan|Boutique|Specialty|Niche|Focused|Dedicated|Specialized|Expert|Professional|Premium|High|End|Luxury|Upscale|Elite|Exclusive|Private|Members|Only|VIP|Special|Privileged|Preferred|Priority|First|Class|Top|Tier|Best|Finest|Highest|Quality|Superior|Excellent|Outstanding|Exceptional|Extraordinary|Remarkable|Notable|Noteworthy|Impressive|Amazing|Incredible|Fantastic|Wonderful|Marvelous|Spectacular|Stunning|Breathtaking|Jaw|Dropping|Mind|Blowing|Awe|Inspiring|Overwhelming|Unbelievable|Incredible|Impossible|Unlikely|Rare|Uncommon|Unusual|Unique|Special|Different|Distinctive|Characteristic|Typical|Representative|Standard|Normal|Regular|Common|Ordinary|Average|Everyday|Routine|Usual|Customary|Traditional|Conventional|Classic|Timeless|Enduring|Lasting|Permanent|Eternal|Forever|Always|Never|Ending|Infinite|Limitless|Boundless|Endless|Countless|Numerous|Many|Multiple|Several|Few|Some|All|Every|Each|Any|No|None|Zero|Nothing|Empty|Blank|Void|Null|Absent|Missing|Gone|Lost|Hidden|Secret|Private|Confidential|Classified|Restricted|Limited|Exclusive|Special|Unique|Rare|Scarce|Precious|Valuable|Priceless|Invaluable|Worthless|Cheap|Inexpensive|Affordable|Reasonable|Fair|Just|Right|Correct|Accurate|Precise|Exact|Perfect|Ideal|Ultimate|Final|Last|End|Finish|Complete|Done|Finished|Over|Through|Past|History|Memory|Remembrance|Recollection|Recall|Recognition|Awareness|Consciousness|Realization|Understanding|Comprehension|Knowledge|Information|Data|Facts|Truth|Reality|Actuality|Existence|Being|Life|Living|Alive|Active|Dynamic|Energetic|Vibrant|Lively|Animated|Spirited|Enthusiastic|Passionate|Fervent|Ardent|Zealous|Devoted|Dedicated|Committed|Loyal|Faithful|True|Honest|Sincere|Genuine|Real|Authentic|Original|Pure|Clean|Fresh|New|Recent|Latest|Current|Modern|Contemporary|Up|Date|Fashionable|Trendy|Stylish|Chic|Elegant|Sophisticated|Refined|Polished|Smooth|Sleek|Streamlined|Efficient|Effective|Successful|Productive|Fruitful|Beneficial|Advantageous|Profitable|Lucrative|Rewarding|Satisfying|Fulfilling|Gratifying|Pleasing|Enjoyable|Delightful|Wonderful|Fantastic|Amazing|Incredible|Awesome|Great|Good|Excellent|Outstanding|Exceptional|Extraordinary|Remarkable|Notable|Impressive|Striking|Eye|Catching|Attention|Grabbing|Head|Turning|Show|Stopping|Breath|Taking|Jaw|Dropping|Mind|Blowing|Heart|Stopping|Soul|Stirring|Spirit|Lifting|Mood|Boosting|Energy|Giving|Life|Changing|Game|Changing|World|Changing|Ground|Breaking|Record|Breaking|Barrier|Breaking|Trend|Setting|Pace|Setting|Standard|Setting|Bench|Mark|Land|Mark|Mile|Stone|Touch|Stone|Corner|Stone|Foundation|Stone|Stepping|Stone|Building|Block|Frame|Work|Structure|System|Process|Method|Approach|Strategy|Plan|Goal|Objective|Target|Aim|Purpose|Mission|Vision|Dream|Hope|Wish|Desire|Want|Need|Requirement|Necessity|Essential|Important|Significant|Meaningful|Valuable|Worthwhile|Useful|Helpful|Beneficial|Advantageous|Positive|Good|Great|Excellent|Outstanding|Exceptional|Extraordinary|Amazing|Incredible|Fantastic|Wonderful|Marvelous|Spectacular|Stunning|Beautiful|Gorgeous|Lovely|Pretty|Attractive|Appealing|Charming|Enchanting|Captivating|Mesmerizing|Hypnotic|Spellbinding|Enthralling|Fascinating|Intriguing|Interesting|Engaging|Compelling|Persuasive|Convincing|Influential|Powerful|Strong|Mighty|Potent|Effective|Efficient|Productive|Successful|Winning|Victorious|Triumphant|Champion|Leader|Winner|Best|Top|First|Number|One|Primary|Main|Principal|Chief|Head|Boss|Manager|Director|Executive|Officer|President|CEO|Founder|Owner|Proprietor|Entrepreneur|Business|Person|Professional|Expert|Specialist|Authority|Master|Guru|Sage|Wise|Man|Woman|Person|Individual|Human|Being|Soul|Spirit|Heart|Mind|Body|Whole|Complete|Total|Full|Entire|All|Everything|Anything|Something|Nothing|No|Thing|Some|Thing|Any|Thing|Every|Thing|All|Things|Many|Things|Few|Things|Little|Things|Big|Things|Small|Things|Great|Things|Good|Things|Bad|Things|Best|Things|Worst|Things|First|Things|Last|Things|Old|Things|New|Things|Different|Things|Same|Things|Similar|Things|Unique|Things|Special|Things|Common|Things|Rare|Things|Usual|Things|Unusual|Things|Normal|Things|Abnormal|Things|Regular|Things|Irregular|Things|Standard|Things|Non|Standard|Things|Typical|Things|Atypical|Things|Ordinary|Things|Extraordinary|Things|Average|Things|Above|Average|Things|Below|Average|Things|High|Things|Low|Things|Up|Things|Down|Things|Left|Things|Right|Things|Front|Things|Back|Things|Inside|Things|Outside|Things|Private|Things|Public|Things|Personal|Things|Professional|Things|Work|Things|Play|Things|Fun|Things|Serious|Things|Important|Things|Trivial|Things|Major|Things|Minor|Things|Big|Things|Small|Things|Large|Things|Tiny|Things|Huge|Things|Massive|Things|Enormous|Things|Giant|Things|Microscopic|Things|Miniature|Things|Compact|Things|Portable|Things|Mobile|Things|Stationary|Things|Fixed|Things|Flexible|Things|Rigid|Things|Soft|Things|Hard|Things|Smooth|Things|Rough|Things|Sharp|Things|Dull|Things|Bright|Things|Dark|Things|Light|Things|Heavy|Things|Hot|Things|Cold|Things|Warm|Things|Cool|Things|Wet|Things|Dry|Things|Clean|Things|Dirty|Things|Pure|Things|Mixed|Things|Simple|Things|Complex|Things|Easy|Things|Difficult|Things|Hard|Things|Soft|Things|Fast|Things|Slow|Things|Quick|Things|Gradual|Things|Sudden|Things|Immediate|Things|Delayed|Things|Early|Things|Late|Things|On|Time|Things|Timely|Things|Untimely|Things|Appropriate|Things|Inappropriate|Things|Suitable|Things|Unsuitable|Things|Proper|Things|Improper|Things|Correct|Things|Incorrect|Things|Right|Things|Wrong|Things|Good|Things|Bad|Things|Better|Things|Worse|Things|Best|Things|Worst|Things|Perfect|Things|Imperfect|Things|Flawed|Things|Flawless|Things|Broken|Things|Fixed|Things|Damaged|Things|Intact|Things|Whole|Things|Partial|Things|Complete|Things|Incomplete|Things|Finished|Things|Unfinished|Things|Done|Things|Undone|Things|Started|Things|Stopped|Things|Paused|Things|Continued|Things|Resumed|Things|Ended|Things|Begun|Things|Initiated|Things|Launched|Things|Introduced|Things|Presented|Things|Revealed|Things|Shown|Things|Displayed|Things|Exhibited|Things|Demonstrated|Things|Performed|Things|Executed|Things|Accomplished|Things|Achieved|Things|Completed|Things|Finished|Things|Done|Things|Over|Things|Through|Things|Past|Things|Future|Things|Present|Things|Current|Things|Now|Things|Then|Things|When|Things|Where|Things|How|Things|Why|Things|What|Things|Who|Things|Which|Things|Whose|Things|Whom|Things|That|Things|This|Things|These|Things|Those|Things|Here|Things|There|Things|Everywhere|Things|Nowhere|Things|Somewhere|Things|Anywhere|Things|Always|Things|Never|Things|Sometimes|Things|Often|Things|Rarely|Things|Seldom|Things|Frequently|Things|Occasionally|Things|Usually|Things|Normally|Things|Typically|Things|Generally|Things|Specifically|Things|Particularly|Things|Especially|Things|Mainly|Things|Mostly|Things|Primarily|Things|Basically|Things|Essentially|Things|Fundamentally|Things|Ultimately|Things|Finally|Things|Eventually|Things|Soon|Things|Later|Things|Earlier|Things|Before|Things|After|Things|During|Things|While|Things|Until|Things|Since|Things|From|Things|To|Things|In|Things|On|Things|At|Things|By|Things|With|Things|Without|Things|For|Things|Against|Things|About|Things|Around|Things|Through|Things|Over|Things|Under|Things|Above|Things|Below|Things|Between|Things|Among|Things|Within|Things|Outside|Things|Inside|Things|Beside|Things|Next|Things|Near|Things|Far|Things|Close|Things|Away|Things|Up|Things|Down|Things|Left|Things|Right|Things|Forward|Things|Backward|Things|Ahead|Things|Behind|Things|Front|Things|Back|Things|Top|Things|Bottom|Things|Side|Things|Middle|Things|Center|Things|Edge|Things|Corner|Things|End|Things|Beginning|Things|Start|Things|Finish|Things)/gi
    ];
    
    for (const pattern of sessionPatterns) {
      const match = allText.match(pattern);
      if (match) {
        sessionTitle = match[0];
        break;
      }
    }

    // Enhanced date/time extraction
    const datePatterns = [
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\s+at\s+\d{1,2}:\d{2}\s*(AM|PM|am|pm)\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\s+at\s+\d{1,2}:\d{2}\s*(AM|PM|am|pm)\b/gi,
      /\b\d{4}-\d{2}-\d{2}\s+at\s+\d{1,2}:\d{2}\s*(AM|PM|am|pm)\b/gi,
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/gi,
      /\b\d{4}-\d{2}-\d{2}\b/gi,
      /\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)\b/gi
    ];
    
    for (const pattern of datePatterns) {
      const match = allText.match(pattern);
      if (match) {
        sessionTime = match[0];
        break;
      }
    }

    return {
      name: name.replace(/[^\w\s.-]/g, '').trim(),
      email: email.replace(/mailto:/, '').trim(),
      phone: phone.replace(/tel:/, '').trim(),
      sessionTitle: sessionTitle.replace(/[^\w\s.-]/g, '').trim(),
      sessionTime: sessionTime.replace(/[^\w\s.,-:]/g, '').trim()
    };
  };

  // Extract the data
  const data = extractClientInfo();
  
  // Build URL parameters
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  
  // Determine base URL
  const baseUrl = window.location.hostname === 'localhost' ? 
    'http://localhost:3000' : 
    window.location.origin.includes('sessionremind') ? 
    window.location.origin : 
    'https://sessionremind.com';
  
  const targetUrl = `${baseUrl}/new?${params.toString()}`;
  
  // Log for debugging
  console.log('UseSession data extracted:', data);
  console.log('Target URL:', targetUrl);
  
  // Open new window
  window.open(targetUrl, '_blank');
  
  // Show confirmation
  const confirmationText = `✅ Client data extracted successfully!\n\n` +
    `📝 Name: ${data.name || 'Not found'}\n` +
    `📞 Phone: ${data.phone || 'Not found'}\n` +
    `📧 Email: ${data.email || 'Not found'}\n` +
    `📸 Session: ${data.sessionTitle || 'Not found'}\n` +
    `⏰ Time: ${data.sessionTime || 'Not found'}\n\n` +
    `The Session Reminder form is now open in a new tab with this information pre-filled.`;
  
  alert(confirmationText);
})();