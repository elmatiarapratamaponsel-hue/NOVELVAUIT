import { Novel } from '../types/novel';

export const SAMPLE_NOVELS: Novel[] = [
  {
    id: 'novel-1',
    title: 'Lembayung di Balik Cakrawala',
    author: 'Raden Arya Bramantyo',
    genre: 'Fantasi & Petualangan',
    year: 2023,
    synopsis: 'Di sebuah kepulauan misterius Nusantara yang terlupakan oleh peta dunia modern, seorang pemuda pemahat perunggu bernama Arga menemukan prasasti kuno yang dapat membangkitkan kembali gerbang cakrawala. Bersama seekor elang bersayap emas dan seorang penenun ramalan, ia harus berlayar menembus badai abadi sebelum kekuatan gelap dari kedalaman palung memadamkan matahari terakhir.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    fileType: 'text',
    fileName: 'lembayung_di_balik_cakrawala.epub',
    fileSize: '2.4 MB',
    status: 'sedang_dibaca',
    isFavorite: true,
    currentPage: 142,
    totalPages: 380,
    progressPercentage: 37,
    createdAt: '2026-10-15T08:30:00.000Z',
    updatedAt: '2026-11-04T19:20:00.000Z',
    lastReadAt: '2026-11-04T19:20:00.000Z',
    chapters: [
      {
        id: 'c1',
        title: 'Bab 1: Suara dari Palung Laut Selat Sunda',
        content: `Kabut tebal membungkus pesisir dermaga tua itu layaknya kain kafan yang belum kering. Angin malam membawa bau garam laut yang pekat bercampur lumut basah. Arga berdiri di ujung geladak perahu kayu miliknya, memandang horizon yang tampak terbelah oleh kilatan petir tanpa guntur.

"Kau yakin ingin berlayar malam ini, nak?" suara parau Ki Danu memecah derit kayu lambung kapal. Pria tua itu memegang lentera minyak yang apinya bergetar dihempas angin selat.

Arga tidak langsung menjawab. Jemarinya meraba liontin perunggu berpahat ular naga berkepala tujuh yang tergantung di balik bajunya. Logam dingin itu kini memancarkan hawa hangat yang aneh, seolah berdenyut mengikuti detak jantungnya sendiri.

"Prasasti di gua karang sudah mulai retak, Ki," ujar Arga dengan nada rendah namun mantap. "Jika air pasang merah mencapai batas pilar, gerbang cakrawala akan terkunci selama seribu tahun lagi. Kita tidak punya waktu menunggu fajar."

Lentera tua itu bergoyang kian liar. Dari kejauhan, di tengah palung yang biasanya tenang, pusaran air raksasa mulai berpendar kebiruan. Suatu kekuatan yang telah tertidur sejak zaman wangsa purba sedang menggeliat bangun.`
      },
      {
        id: 'c2',
        title: 'Bab 2: Penenun Benang Emas',
        content: `Pulau Karang Tembaga tidak pernah tercatat di atlas para nakhoda kompeni. Pulau itu hanya muncul ketika bintang Biduk Sejajar bersilangan dengan ekor komet perak. Di sanalah Arga menemukan pondok gantung tempat tinggal Niskala.

Gadis penenun itu tidak memutar kepalanya saat pintu berderit terbuka. Jemarinya yang ramping menari lincah di atas alat tenun tradisional yang terbuat dari kayu cendana hitam. Benang yang ia gunakan bukanlah sutra biasa, melainkan serat cahaya fajar yang dipintal dengan tetesan embun pegunungan.

"Kau terlambat tiga hari, Arga," bisik Niskala tanpa menghentikan kayuhan kakinya pada pedal tenun. "Bayangan dari palung sudah menyentuh mimpi buruk anak-anak di pesisir barat."

Arga meletakkan batu segel di atas meja kayu. "Peta pelayaran yang kau kirimkan melalui burung camar hampir membuat perahuku karam di karang berdarah. Tapi aku berhasil membawanya."

Niskala akhirnya mengangkat wajahnya. Matanya berwarna jingga seperti matahari terbenam di musim kemarau. "Itu belum apa-apa. Ujian sesungguhnya menunggumu di gerbang pusaran ketujuh."`
      },
      {
        id: 'c3',
        title: 'Bab 3: Badai Abadi dan Sang Garuda Langit',
        content: `Langit menggelap menjadi hitam legam di siang hari bolong. Ombak setinggi pohon kelapa menghantam dinding perahu dengan murka yang belum pernah disaksikan manusia daratan. 

Di tengah kegelapan itu, sebuah pekikan nyaring membelah badai. Seekor burung raksasa berbulu emas berkilauan menukik dari balik awan kelabu. Kepakan sayapnya menciptakan pusaran angin tandingan yang menahan laju ombak raksasa sebelum menenggelamkan perahu Arga.

"Pegang kemudimu kencang-kencang!" seru Niskala sambil merentangkan selendang tenunnya yang berkibar laksana lidah api. 

Arga mengerahkan seluruh tenaganya memutar bilah kemudi kayu jati. Di hadapan mereka, lautan membuka jalan: sebuah ngarai air vertikal dengan dinding-dinding ombak yang membeku seperti kristal zamrud. Di dasar ngarai itulah pintu gerbang kuno berdiri kokoh, menanti sentuhan sang pewaris perunggu.`
      }
    ],
    notes: [
      {
        id: 'note-1',
        page: 45,
        chapterTitle: 'Bab 1',
        text: 'Karakter Arga sangat menarik, deskripsi suasana dermaga kerasa mistis dan kaya budaya lokal.',
        createdAt: '2026-10-18T14:10:00.000Z'
      }
    ]
  },
  {
    id: 'novel-2',
    title: 'Sinyal dari Nebula Omega',
    author: 'Prof. Ilham Satria, Ph.D.',
    genre: 'Sci-Fi & Ruang Angkasa',
    year: 2024,
    synopsis: 'Tahun 2187, stasiun observatorium antariksa khatulistiwa Nusantara mendeteksi kode biner misterius yang terpancar dari jantung Nebula Omega. Saat sinyal tersebut diterjemahkan, ia berisi koordinat sebuah kapal koloni manusia yang hilang tanpa jejak seratus lima puluh tahun lalu. Seorang astrofisikawan muda dan AI navigasi kapal dikirim untuk penyelidikan yang berujung pada konspirasi waktu antar galaksi.',
    coverUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=800',
    fileType: 'pdf',
    fileName: 'sinyal_nebula_omega_full.pdf',
    fileSize: '5.8 MB',
    status: 'selesai',
    isFavorite: true,
    currentPage: 412,
    totalPages: 412,
    progressPercentage: 100,
    createdAt: '2026-09-10T11:00:00.000Z',
    updatedAt: '2026-10-29T16:45:00.000Z',
    lastReadAt: '2026-10-29T16:45:00.000Z',
    chapters: [
      {
        id: 'so-1',
        title: 'Bab 1: Anomali Frekuensi 1420 MHz',
        content: `Ruang kendali Observatorium Antariksa Khatulistiwa di orbit geosinkron sangat sunyi kecuali dengung rendah reaktor fusi dingin. Di layar hologram utama selebar sepuluh meter, grafik gelombang elektromagnetik dari sektor kuadran 9 tiba-tiba melonjak menembus ambang batas normal.

"Astra, verifikasi data telemetri," ucap Dr. Tania Wardhana seraya mengusap matanya yang lelah setelah giliran jaga enam belas jam tanpa henti.

"Sinyal terverifikasi bukan derau kosmik alami, Dokter," suara sintesis Astra terdengar jernih melalui antarmuka saraf Tania. "Pola pengulangan Fibonacci terdeteksi dengan interval tepat 1,618 detik. Modulasi pembawa berasal dari koordinat Nebula Omega."

Tania menegakkan punggungnya. Jantungnya berdegup kencang saat kode-kode heksadesimal mulai mengurai pesan teks kuno: 'KAMI MASIH HIDUP DI RUANG SELA'.`
      },
      {
        id: 'so-2',
        title: 'Bab 2: Kapal Hantu Nusantara IV',
        content: `Pintu kedap udara kapal penjelajah Bima Sakti berdesis ketika mekanisme penyegelan magnetik terbuka. Di depan Tania membentang lorong panjang berlapis es kosmik tipis. Kapal koloni Nusantara IV yang hilang satu setengah abad lalu kini berada tepat di hadapannya, terapung membisu di antara debu bintang keunguan.

Lampu helm antariksa Tania menyorot dinding kabin. Tidak ada tanda-tanda dekompresi darurat ataupun pertempuran. Makanan sintetis di meja makan bahkan tampak seperti baru saja ditinggalkan sepuluh menit lalu, masih mengepulkan uap beku dalam gravitasi mikro.

"Semua catatan log data terenkripsi dengan kunci kuantum tingkat militer," lapor Astra. "Namun saya mendeteksi satu tanda vital manusia di ruang kriogenik tingkat paling bawah."`
      }
    ]
  },
  {
    id: 'novel-3',
    title: 'Misteri Rumah Berkabut Lembang',
    author: 'Kirana Dewi Larasati',
    genre: 'Misteri & Detektif',
    year: 2022,
    synopsis: 'Di sebuah vila peninggalan kolonial Belanda di lereng Gunung Tangkuban Parahu, seorang kolektor jam antik ditemukan tewas di dalam ruangan terkunci dengan semua jarum jam menunjuk ke pukul 03.17. Detektif swasta Mahesa bersama wartawati investigasi lokal menelusuri rahasia keluarga ningrat Priangan yang terkubur selama tiga generasi.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    fileType: 'epub',
    fileName: 'misteri_rumah_berkabut_lembang.epub',
    fileSize: '3.1 MB',
    status: 'sedang_dibaca',
    isFavorite: false,
    currentPage: 88,
    totalPages: 320,
    progressPercentage: 28,
    createdAt: '2026-10-25T13:15:00.000Z',
    updatedAt: '2026-11-03T21:10:00.000Z',
    lastReadAt: '2026-11-03T21:10:00.000Z',
    chapters: [
      {
        id: 'mr-1',
        title: 'Bab 1: Dentang Jam Dinding Jam Tiga Lewat Tujuh Belas',
        content: `Kabut Lembang selalu turun dengan cara yang sunyi namun mematikan. Jalanan aspal berkelok di kawasan Maribaya tenggelam dalam warna putih susu yang menipu mata pengendara. Mahesa mematikan mesin jip tuanya tepat di depan gerbang besi berkarat Villa Rust En Vrede.

Kapten Polisi Sitorus sudah menunggunya di teras marmer yang dingin. "Kasus ganjil lagi, Hes. Tuan van Dijk ditemukan telentang di ruang kerjanya. Tidak ada luka luar, tidak ada racun di cangkir tehnya, dan pintu terkunci dari dalam dengan grendel kuningan utuh."

Mahesa melangkah masuk ke ruangan kerja korban. Bau kayu jati tua bercampur minyak lavender dan tembakau pipa langsung menyergap hidungnya. Di sekeliling dinding ruangan, terdapat tak kurang dari empat puluh jam dinding mekanik kuno buatan abad ke-18 dan ke-19.

Semuanya telah berhenti berdetak di waktu yang persis sama: pukul tiga lewat tujuh belas menit.`
      }
    ]
  },
  {
    id: 'novel-4',
    title: 'Senja di Sudut Malioboro',
    author: 'Dian Anggraini',
    genre: 'Romansa & Slice of Life',
    year: 2021,
    synopsis: 'Kisah pertemuan tak disengaja antara Nadia, seorang arsitek konservasi cagar budaya yang sedang bertugas merevitalisasi bangunan tua di Titik Nol Yogyakarta, dengan Banyu, pemilik kedai kopi buku tersembunyi di gang Sosrowijayan. Di tengah riuh pejalan kaki dan alunan musisi angklung jalanan, keduanya saling berbagi luka masa lalu dan menemukan harapan baru.',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800',
    fileType: 'text',
    fileName: 'senja_sudut_malioboro.txt',
    fileSize: '1.2 MB',
    status: 'belum_dibaca',
    isFavorite: true,
    currentPage: 0,
    totalPages: 260,
    progressPercentage: 0,
    createdAt: '2026-10-28T09:00:00.000Z',
    updatedAt: '2026-10-28T09:00:00.000Z',
    chapters: [
      {
        id: 'sm-1',
        title: 'Bab 1: Aroma Kopi Arabika dan Kertas Kusam',
        content: `Hujan gerimis khas bulan November baru saja membasahi trotoar batu andesit Malioboro. Bau petrikor yang khas menguar berbaur dengan asap arang dari gerobak angkringan di seberang jalan. Nadia melangkah cepat menyelamatkan buku sketsa arsitekturnya yang hampir basah di balik jas hujan tipis.

Sebuah plang kayu kecil berukir aksara Jawa dan Latin di sudut gang sempit menarik perhatiannya: 'Kedai Buku Sudut Tenang - Kopi, Cerita, & Nostalgia'.

Ketika ia mendorong pintu kaca yang berdenting oleh lonceng tembaga, suasana bising Malioboro seketika lenyap seperti ditelan dinding kedap suara. Rak-rak kayu setinggi langit-langit penuh dengan ribuan novel antik dan ensiklopedia bersampul kain mori. Di balik meja bar berlapis ubin antik tegel kunci, seorang pria muda bercelemek kanvas hitam sedang menuangkan air panas ke corong dripper keramik putih.`
      }
    ]
  },
  {
    id: 'novel-5',
    title: 'Kronik Tanah Jawadwipa: Babat Pendekar Bayangan',
    author: 'Ki Haryo Daniswara',
    genre: 'Sejarah & Aksi',
    year: 2025,
    synopsis: 'Pada masa keemasan kerajaan Majapahit di bawah kepemimpinan Mahapatih Gajah Mada, sekelompok pendekar tanpa nama ditugaskan menjaga perbatasan timur dari intrik pemberontakan rahasia. Pertarungan jurus silat keris pamor dan siasat perang kuno yang memukau.',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
    fileType: 'pdf',
    fileName: 'kronik_tanah_jawadwipa.pdf',
    fileSize: '6.4 MB',
    status: 'belum_dibaca',
    isFavorite: false,
    currentPage: 0,
    totalPages: 450,
    progressPercentage: 0,
    createdAt: '2026-11-01T15:00:00.000Z',
    updatedAt: '2026-11-01T15:00:00.000Z',
    chapters: [
      {
        id: 'kj-1',
        title: 'Bab 1: Kilatan Pamor di Bukit Penanggungan',
        content: `Cahaya purnama purnama siddhi memandikan puncak suci Pawitra dengan kilau perak keemasan. Di pelataran candi bertingkat yang sunyi, sesosok bayangan berkelebat cepat bagaikan burung alap-alap menyambar mangsa.

Kala itu, bumi Jawadwipa sedang berada di persimpangan jalan sejarah yang menentukan. Sumpah Palapa baru saja diikrarkan di hadapan Sri Tribhuwana Tunggadewi, namun di balik kemegahan gapura wringin lawang, desas-desus pengkhianatan mulai disebarkan oleh utusan rahasia dari seberang lautan.`
      }
    ]
  }
];

export const PRESET_COVERS = [
  {
    name: 'Mistik Malam Laut',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    category: 'Fantasi'
  },
  {
    name: 'Galaksi Kosmik',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=800',
    category: 'Sci-Fi'
  },
  {
    name: 'Vila Klasik Kuno',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    category: 'Misteri'
  },
  {
    name: 'Sudut Kedai Kopi',
    url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800',
    category: 'Romansa'
  },
  {
    name: 'Kuil Hutan Reruntuhan',
    url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
    category: 'Sejarah'
  },
  {
    name: 'Buku Ajaib Berpendar',
    url: 'https://images.unsplash.com/photo-1532012164546-f432f2e37271?auto=format&fit=crop&q=80&w=800',
    category: 'Sihir'
  }
];

export const GENRE_LIST = [
  'Semua Genre',
  'Fantasi & Petualangan',
  'Sci-Fi & Ruang Angkasa',
  'Misteri & Detektif',
  'Romansa & Slice of Life',
  'Sejarah & Aksi',
  'Horor & Supranatural',
  'Thriller & Kriminal',
  'Pengembangan Diri'
];
