import type {TransformerOption} from '@cld-apis/types'
import {setConfig, buildImageUrl} from 'cloudinary-build-url'
import type {OptionalTeam} from './utils/misc'

setConfig({
  cloudName: 'kentcdodds-com',
})

type ImageBuilder = {
  (transformations?: TransformerOption): string
  alt: string
  id: string
}
const createImages = <
  ImageType extends Record<string, {id: string; alt: string}>,
>(
  images: ImageType,
) => {
  const imageBuilders: Record<string, ImageBuilder> = {}
  for (const [name, {id, alt}] of Object.entries(images)) {
    imageBuilders[name] = getImageBuilder(id, alt)
  }
  return imageBuilders as {[Name in keyof ImageType]: ImageBuilder}
}

function getImageBuilder(id: string, alt: string = ''): ImageBuilder {
  function imageBuilder(transformations?: TransformerOption) {
    return buildImageUrl(id, {transformations})
  }
  imageBuilder.alt = alt
  imageBuilder.id = id
  return imageBuilder
}

const images = createImages({
  kentSignatureDarkMode: {
    id: 'kent/signature-dark-mode',
    alt: `Kent's signature`,
  },
  kentSignatureLightMode: {
    id: 'kent/signature-light-mode',
    alt: `Kent's signature`,
  },
  kentTransparentProfile: {
    id: 'kent/profile-transparent',
    alt: 'Kent C. Dodds',
  },
  kentProfile: {
    id: 'kent/profile',
    alt: 'Kent C. Dodds',
  },
  kentSnowSports: {
    id: 'kent/snow-sports',
    alt: 'Kent wearing snow clothes with skis and a snowboard',
  },
  kentCodingWithKody: {
    id: 'kent/coding-with-kody',
    alt: 'Kent sitting with his laptop on a bench next to Kody the Koala',
  },
  kentRidingOnewheelOutdoors: {
    id: 'kent/riding-onewheel-outdoors',
    alt: 'Kent riding a onewheel outdoors',
  },
  kentRidingOnewheelOutdoorsFast: {
    id: 'kent/riding-onewheel-outdoors-fast',
    alt: 'Kent riding a onewheel outdoors fast',
  },
  kentWorkingInNature: {
    id: 'kent/working-in-nature',
    alt: 'Kent working in nature',
  },
  kentPalmingSoccerBall: {
    id: 'kent/palming-soccer-ball',
    alt: 'Kent holding a soccer ball',
  },
  kentCodingWithSkates: {
    id: 'kent/rollerblade-coding-checking-watch',
    alt: 'Kent checking his watch while sitting in rollerblades with a laptop',
  },
  kentHoldingOutCody: {
    id: 'kent/holding-out-kody',
    alt: 'Kent holding out Kody the Koala',
  },
  kentCodingOnCouch: {
    id: 'kent/coding-on-couch',
    alt: 'Kent coding on a couch',
  },
  kentSmilingWithLaptop: {
    id: 'kent/smiling-with-laptop-on-couch',
    alt: 'Kent smiling with laptop on a couch',
  },
  kentWithOnewheel: {
    id: 'kent/walking-away-with-onewheel',
    alt: 'Kent walking away with a onewheel',
  },
  kentSkatingGear: {
    id: 'kent/skating-gear',
    alt: 'Kent with skating gear',
  },
  kentSpeakingAllThingsOpen: {
    id: 'kent/kent-speaking-all-things-open',
    alt: 'Kent speaking all things open',
  },
  mrRogersBeKind: {
    id: 'kent/video-stills/mr-rogers-be-kind',
    alt: 'Laptop with a sticker with a photo of Mr. Rogers and the words "Be kind"',
  },
  microphoneWithHands: {
    id: 'kent/video-stills/microphone-with-hands',
    alt: 'A microphone and hands',
  },
  happySnowboarder: {
    id: 'kent/video-stills/happy-snowboarder',
    alt: 'Kent smiling covered in snow',
  },
  kentListeningAtReactRally: {
    id: 'kent/kent-listening-at-react-rally',
    alt: 'Kent sitting as an audience member at React Rally',
  },
  getToKnowKentVideoThumbnail: {
    id: 'kent/video-stills/get-to-know-kent-video-thumbnail',
    alt: 'Kent in the air on a snowboard with the words "Get to know Kent C. Dodds"',
  },

  kodyProfileYellow: {
    id: 'kentcdodds.com/illustrations/kody_profile_yellow',
    alt: 'Kody Profile in Yellow',
  },
  kodyProfileBlue: {
    id: 'kentcdodds.com/illustrations/kody_profile_blue',
    alt: 'Kody Profile in Blue',
  },
  kodyProfileRed: {
    id: 'kentcdodds.com/illustrations/kody_profile_red',
    alt: 'Kody Profile in Red',
  },
  kodyProfileWhite: {
    id: 'kentcdodds.com/illustrations/kody_profile_white',
    alt: 'Kody Profile in White',
  },
  teslaY: {
    id: 'kentcdodds.com/illustrations/tesla_y2_j8kti2',
    alt: 'Illustration of a Tesla Model Y',
  },
  solarPanels: {
    id: 'kentcdodds.com/illustrations/solar_panels_2_ftbwvb',
    alt: 'Illustration of Solar Panels',
  },
  snowboard: {
    id: 'kentcdodds.com/illustrations/snowboard_nqqlyr',
    alt: 'Illustration of a snowboard',
  },
  skis: {
    id: 'kentcdodds.com/illustrations/skis_z5lkc3',
    alt: 'Illustration of skis',
  },
  kayak: {
    id: 'kentcdodds.com/illustrations/rowing',
    alt: 'Illustration of a kayak',
  },
  onewheel: {
    id: 'kentcdodds.com/illustrations/one_wheel',
    alt: 'Illustration of a onewheel',
  },
  microphone: {
    id: 'kentcdodds.com/illustrations/mic',
    alt: 'Illustration of a microphone',
  },
  kodySnowboardingWhite: {
    id: 'kentcdodds.com/illustrations/kody-flying_white',
    alt: 'Illustration of Kody the Koala standing on a snowboard surrounded by green leaves, a battery, two skies, a one-wheel, a solar panel, and a recycle logo.',
  },
  kodySnowboardingYellow: {
    id: 'kentcdodds.com/illustrations/kody-flying_yellow',
    alt: 'Illustration of Kody the Koala standing on a snowboard surrounded by green leaves, a battery, two skies, a one-wheel, a solar panel, and a recycle logo.',
  },
  kodySnowboardingRed: {
    id: 'kentcdodds.com/illustrations/kody-flying_red',
    alt: 'Illustration of Kody the Koala standing on a snowboard surrounded by green leaves, a battery, two skies, a one-wheel, a solar panel, and a recycle logo.',
  },
  kodySnowboardingBlue: {
    id: 'kentcdodds.com/illustrations/kody-flying_blue',
    alt: 'Illustration of Kody the Koala standing on a snowboard surrounded by green leaves, a battery, two skies, a one-wheel, a solar panel, and a recycle logo.',
  },
  helmet: {
    id: 'kentcdodds.com/illustrations/helmet',
    alt: 'Illustration of a helmet',
  },
  kodyYellow: {
    id: 'kentcdodds.com/illustrations/kody_yellow',
    alt: 'Illustration of snowboarder in yellow',
  },
  kodyRed: {
    id: 'kentcdodds.com/illustrations/kody_red',
    alt: 'Illustration of snowboarder in red',
  },
  kodyBlue: {
    id: 'kentcdodds.com/illustrations/kody_blue',
    alt: 'Illustration of snowboarder in blue',
  },
  bustedOnewheel: {
    id: 'kentcdodds.com/illustrations/404_2_sprold',
    alt: 'Broken onewheel',
  },
  courseAdvancedReactComponentPatterns: {
    id: 'kentcdodds.com/pages/courses/advanced-react-component-patterns',
    alt: 'Illustration for React Class Component Patterns',
  },
  courseAsts: {
    id: 'kentcdodds.com/pages/courses/asts',
    alt: 'Illustration for Code Transformation and Linting with ASTs',
  },
  courseEpicReact: {
    id: 'kentcdodds.com/pages/courses/rocket',
    alt: 'Illustration of a Rocket',
  },
  courseHowToContributeToAnOpenSourceProjectOnGitHub: {
    id: 'kentcdodds.com/pages/courses/how-to-contribute-to-an-open-source-project-on-github',
    alt: 'Illustration for How to Contribute to an Open Source Project on GitHub',
  },
  courseHowToWriteAnOpenSourceJavaScriptLibrary: {
    id: 'kentcdodds.com/pages/courses/how-to-write-an-open-source-javascript-library',
    alt: 'Illustration for How to Write an Open Source JavaScript Library',
  },
  courseSimplifyReactAppsWithReactHooks: {
    id: 'kentcdodds.com/pages/courses/simplify-react-apps-with-react-hooks',
    alt: 'Illustration for Simplify React Apps with React Hooks',
  },
  courseTestingJS: {
    id: 'kentcdodds.com/pages/courses/testing-trophy',
    alt: 'Illustration of a trophy',
  },
  courseTestingPrinciples: {
    id: 'kentcdodds.com/pages/courses/testing-principles',
    alt: 'Illustration for JavaScript Testing Practices and Principles',
  },
  courseTestingReact: {
    id: 'kentcdodds.com/pages/courses/testing-react',
    alt: 'Illustration for Testing React Applications, v2',
  },
  courseTheBeginnersGuideToReact: {
    id: 'kentcdodds.com/pages/courses/the-beginners-guide-to-react',
    alt: `Illustration for The Beginner's Guide to React`,
  },
  courseUpAndRunningWithRemix: {
    id: 'kentcdodds.com/pages/courses/up-and-running-with-remix',
    alt: `Illustration for Up and Running with Remix`,
  },
  courseUseSuspenseToSimplifyYourAsyncUI: {
    id: 'kentcdodds.com/pages/courses/use-suspense-to-simplify-your-async-ui',
    alt: 'Illustration for Use Suspense to Simplify Your Async UI',
  },
  courseFEMAdvancedRemix: {
    id: 'kentcdodds.com/pages/courses/fem-advanced-remix',
    alt: 'Illustration of the Remix logo R with the word "Advanced"',
  },
  courseFEMRemixFundamentals: {
    id: 'kentcdodds.com/pages/courses/fem-remix-fundamentals',
    alt: 'Illustration of the Remix logo R with the word "Fundamentals"',
  },
})

const kodyProfiles: Record<OptionalTeam, {src: string; alt: string}> = {
  RED: {src: images.kodyProfileRed(), alt: images.kodyProfileRed.alt},
  BLUE: {src: images.kodyProfileBlue(), alt: images.kodyProfileBlue.alt},
  YELLOW: {src: images.kodyProfileYellow(), alt: images.kodyProfileYellow.alt},
  UNKNOWN: {src: images.kodyProfileWhite(), alt: images.kodyProfileWhite.alt},
}

const kodySnowboardingImages: Record<OptionalTeam, ImageBuilder> = {
  RED: images.kodySnowboardingRed,
  YELLOW: images.kodySnowboardingYellow,
  BLUE: images.kodySnowboardingBlue,
  UNKNOWN: images.kodySnowboardingWhite,
}

const illustrationImages = {
  teslaY: images.teslaY,
  solarPanels: images.solarPanels,
  snowboard: images.snowboard,
  skis: images.skis,
  kayak: images.kayak,
  onewheel: images.onewheel,
  microphone: images.microphone,
  helmet: images.helmet,
}

function getImgProps(
  imageBuilder: ImageBuilder,
  {
    widths,
    sizes,
    transformations,
  }: {
    widths: Array<number>
    sizes: Array<string>
    transformations?: TransformerOption
  },
) {
  const averageSize = Math.ceil(widths.reduce((a, s) => a + s) / widths.length)

  return {
    alt: imageBuilder.alt,
    src: imageBuilder({
      quality: 'auto',
      format: 'auto',
      ...transformations,
      resize: {width: averageSize, ...transformations?.resize},
    }),
    srcSet: widths
      .map(width =>
        [
          imageBuilder({
            quality: 'auto',
            format: 'auto',
            ...transformations,
            resize: {width, ...transformations?.resize},
          }),
          `${width}w`,
        ].join(' '),
      )
      .join(', '),
    sizes: sizes.join(', '),
    crossOrigin: 'anonymous',
  }
}

function getSocialImageWithPreTitle({
  origin,
  title,
  preTitle,
  featuredImage: img,
  url,
}: {
  origin: string
  title: string
  preTitle: string
  featuredImage: string
  url: string
}) {
  const params = new URLSearchParams({
    type: '2',
    title,
    preTitle,
    img,
    url,
  })
  return `${origin}/img/social?${params.toString()}`
}

function getGenericSocialImage({
  origin,
  words,
  featuredImage: img,
  url,
}: {
  origin: string
  words: string
  featuredImage: string
  url: string
}) {
  const params = new URLSearchParams({
    type: '1',
    words,
    img,
    url,
  })
  return `${origin}/img/social?${params.toString()}`
}

export {
  images,
  kodyProfiles,
  getImgProps,
  getImageBuilder,
  getGenericSocialImage,
  getSocialImageWithPreTitle,
  kodySnowboardingImages,
  illustrationImages,
}
export type {ImageBuilder}
