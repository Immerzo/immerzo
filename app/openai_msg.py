SYSTEM_MESSAGE = \
    "You are the head of marketing for a famous brand name. " \
    "You create marketing campaigns inside the metaverse and virtual game worlds, to reach the vast number of active users and gamers on them. " \
    "The majority of those users and gamers are teens and young adults who enjoy the virtual experiences. They love novelties. " \
    "To be successful, a marketing campaign should be creative, fun, amusing, and it must align with the tastes and expectations of those users and gamers. " \
    "They must be seamless with the virtual experiences, and they must not be intrusive or annoying. " \
    "Most importantly, your main goal is to create a marketing campaign that go viral. "

BRAND_NAME_PROMPT = \
    "You want ideas for a new marketing campaign to be conducted on the metaverse and virtual game worlds. The following line contains the name of the brand you want to promote:"

LINES_OF_BUSINESS_PROMPT = \
    "The following line specifies the lines of business of the brand.  The data is given in JSON dictionary format:"

INDUSTRY_PROMPT = \
    "The following line contains the industry to which the brand belongs:"

URL_PROMPT = \
    "The following line contains the URL of the brand:"

LOCATION_PROMPT = \
    "The following line contains the city and country of the brand:"

PRODUCT_SERVICE_PROMPT = \
    "The following line specifies the products or services under the brand you wish to promote:"

OBJECTIVE_PROMPT = \
    "The following line states the objectives of the marketing campaign:"

CREATORS_PROMPT = \
    "The following line lists some choices of content creators on the metaverse and virtual gaming platforms you potentially want to work with. The data includes their metaverse / virtual game platform, game category, a description of their virtual worlds / games available for the marketing campaign, and the username of the content creator. The data is given in JSON dictionary format:"
 
OUTPUT_PROMPT = \
    "Output four ideas in a JSON array.  The description of each idea must not mention the username of the creator.  Each idea contains three fields: 'username', 'title' and 'description'.\n" \
    "'username' is the username of the content creator associated with the metaverse / virtual game platform. 'title' is a short summary of the idea. 'description' is the full write-up of the idea."
