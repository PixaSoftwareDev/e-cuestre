/**
 * Guarda en product.images las fotos ya subidas a Cloudinary.
 * Correr con: npx tsx scripts/apply-images.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const PREFIX = "https://res.cloudinary.com/dukv3ov6t/image/upload/";

const MAP: Record<string, string[]> = {
  "matera-polo-club": ["lhpfpjci6zdbn3wdnlx3.webp","uggbykixc1yva8jksdqe.webp","gcmo1mh7rborbzmtsxdm.webp","xmlsunywsqmd1fq0uqbq.webp","wn0ykyxk5qurt5w7i2xp.webp","shl4luykirjabptfskq6.webp"],
  "matera-tordillo": ["rnduypnvjznwxna9z2cw.webp","ufbdrh8vqjylb2yunuir.jpg","gq0ueidjlqahh52s948f.jpg","iprbid3v6vbv7dspfx0n.jpg","vcu468qutitpr0gwugde.jpg","tbd9lvkkiqjsq7w432ht.webp"],
  "matera-alazan": ["w0xd41ukqtgat1wlvgau.webp","g2rmkq8gkrkdygda0lhd.jpg","tsgfmdmf4on4arrduabw.webp","tuc77otumklpa1vgn8r4.webp","kogltywzrvpn3ezyrjy7.webp","eyo2bh229knm6f3oygg9.webp"],
  "mate-pintado-i": ["icwsmphpcjhlktw5rzrn.webp","aum97fnwj7vckky63qlh.webp","dihqzup7mwbdr8pdojec.webp","nl98wtywqhqpnykyqrjx.webp","k2lhfxodnmoecqhiyyqm.webp","dr5fj59gunque3wwynkt.webp"],
  "mate-pintado-ii": ["wpwitftf3auoiutdptcr.webp","hkkdccpvyzdta0m75bsv.webp","erlyfgz5lilsdkapliw2.webp","c4mdbsmdj1sdtw8phnsw.webp","hzrwzrvric4bhyl35ndo.webp","kme516mlr62jmylunohk.webp"],
  "mate-negro-quemado": ["jzt6tdowgtfhg0j6ecng.webp","siziqfyoj6ufimurcn0c.webp","ptczgsbg4dexae4150k7.webp","pvt4b69d3igrl4piu7wi.webp","csvbpoqyp9dth3qfwszn.webp","r67lvduvrpggbsc0rseg.webp"],
  "bombilla-alpaca": ["t1fhniee8hrqtpnmqebr.webp","snludniplp5orl2vajeh.webp","nnvqsfc91zwghbjgm2xi.webp","kjcwddofphrfheqct1pp.webp","fpoyqxoo65ab0ifamthf.webp","hzm8zxebrbf1ohygdy4l.webp"],
  "rienda-mini-bag": ["arpzzw0f8fxdur5wkmca.webp","rjdjzjxr1mevxlax4u2a.webp","imtyasxbl8vmxeez8ob9.webp","dv8vuc1bxn6whornfbrv.webp","o55nnoq6kivi0ejdpqav.webp","dbqp4z3sayvqljpmuwmh.webp"],
  "grooming-case": ["oedeclewhwxq6qw5bdo0.webp","g6mfh8uxgmawhciznuiv.webp","rexa1wxyewuy72of7pb8.webp","k6v0bqnepjqija0hoivs.webp","wmna9asygdjaw9actbpi.webp","zkdblzmqkiwu4vldbgbb.webp"],
  "polo-travel-case": ["kpfh2gkzx5uvmyi97ea1.webp","jognvi6fyaxlf3yztnsl.jpg","je4gbgwrqawwgu9nepre.jpg","y1vxsqypxz3uyurkvj5b.jpg","zbtfikokxbpqsq2xnefg.webp","iyenomexxvljls5zlakg.webp"],
  "necesser-heritage": ["ztanw4vajkhlil3p5rwp.webp","dksgtwixsr6c24vc5ggr.webp","oriorsunxdx4dg8dqjnu.webp","pjbicticra8xkmxdbg09.webp","ibqn3injakt2keksmksa.webp","gle8se5vhwfwocvtrhix.webp"],
  "rinonera-noir-saddle": ["nssasf9ducqkmngt72gg.webp","eyjzyxhyp2yjf18zqchi.webp","sjm5nfefqqvpxssbvbfe.webp","wuh1lyvy7efmlib3latv.webp","p6oechbskgmkegn6xuah.webp","vuc1rapo70zewbgljjwb.webp"],
  "cartera-magnolia": ["nvfwudrjrkokqhxndefk.webp","vqpxrquqweqxirgddwoy.jpg","tpnhogjfk3jeq7wb43nu.jpg","gvedmvkpdxvuoztoyp8g.jpg","torybrgyj3i97tnbf5zy.webp","prmuj2wmmdogasapacvo.webp"],
  "palermo-travel-bag": ["zsq4w9xvjovz78pi6f1d.webp","dki1rcahvk5li4ht0kta.webp","ogiraz1g0sepqy7bvuop.webp","bdp4qnj34qm6bcyafupc.webp","lwsqlsfvrwwchxh0mebg.webp","glocb7whjmlbdhyz9pm1.webp"],
  "bolso-cavalier-holdall": ["klyrec3mftklhgpg89yi.webp","le4zfmgvesz1gtxmhhkc.jpg","gbbttdlnhdufxvwuvwtp.jpg","pwq0gbpn68gnjpbsyc2s.webp","f5luwr9v1qs6vus0djul.webp","utekne6iaho7cwiyfisi.webp"],
  "ascot-carryall": ["fqlogew6bjc3bwq41b7l.webp","uh6u8nzxxffgrqh7zr9t.webp","oxhqvgsds0gvaqxmi5li.webp","d752t7fnuudokgs6u2hk.webp","o4kqx48esacvpncohu3c.webp","brj3ndxok4yaodxxvcg0.webp"],
  "windsor-weekender": ["absm7vxtikp3ubops3dj.webp","togcrulq65z12hslohhs.webp","p1darsz27h9gqgyutxfp.webp","qr3zns9401bhugs4bwia.webp","q8na9be5qvksuoj2nq0w.webp","pdfcdvcbecd4xxgs2ihv.webp"],
  "heritage-pack": ["rcmr3j5s2b2mbhbciiep.webp","jxo2prbpxdn7cqxmetdl.webp","d8kx5i595eeeormzijjx.webp","jmagfsttjd0orucb1d1e.webp","bvy5jl5qacbpnadjjdfx.webp","awkd6atgyitd3rvgtbkt.webp"],
  "alfombra-holando": ["tbwus5dvyozrmszdbqmx.webp","poplhcveubklx55vsuoa.webp","jpkvrxugdwzorcmtn5dd.webp","jek9a3tz6qmftt3pu2zn.webp","n6zgecaaqp0tjznozoci.webp","dtytev666vhuz0zgjn8b.webp"],
  "alfombra-hereford": ["fwajz5vz8y4wgpkvehdh.webp","byglmbxmkjo5noerq1uv.webp","k4aup6q6mqunenj9k8gd.webp","mhdavi0rgxdylyfj2l8p.webp","fwjm2w9oq5qxogvdf9yu.webp","mqemddcbbl8gnw72xqau.webp"],
  "alfombra-barcino-oscuro": ["obtmramjrpvwsaosjnoi.webp","lhsjkuoavzkbecrsoabq.webp","eaoknblwxmqoxoaaxr2q.webp","myqhdqomljqd5hsvb3if.webp","bcepbsih0boadg1je2gq.webp","lq0eirnehpjdic94bebk.webp"],
  "alfombra-barcino-claro": ["moaq5v8j82h9f7nndz1d.webp","vbhws8p2b57ojnehq5bq.webp","enfslrapfep1dtfmq8jf.webp","x72sk5ry8hx3xrusuhka.webp","jp8g9qqava4jhdnjbbmg.webp","wcfyeddv3blespkxlcme.webp"],
  "alfombra-salpicado-claro": ["yxa2pqu47gdu0avze762.webp","joobt60apuvv6s9pzqc0.webp","mbc63vxp4vw0s7iknktc.webp","g88ohln0tfgtsqijfozy.webp","kljioajticzrs5dobcav.webp","oojwpiu11ool6yt95emd.webp"],
  "corderito": ["zbvgrunkne6arjli3dzk.webp","ym8g0pypin2mllb1vwdo.jpg","qb4nc0wrj1l9mgrvrw06.webp","zykce9okx5cyowlz26tf.webp","dowohofo5qtnxp0y6ydy.webp"],
  "cuero-lanar-beige": ["mwovgt0oexvryp3oqcao.webp","agui51bvwnj5mxnvgp3b.jpg","qnvlfsgxfbh7oqhqjkff.jpg","jowfcldut8c7e14ojygu.jpg","bxpkctgzukhngfchxlt6.webp","jwuxpee8ey51prp64kdt.webp"],
  "cuero-lanar-blanco": ["vam81ejnuxjrilimqueq.webp","i2opgk2bnt6cjglzst71.jpg","uz7ceefutncvlyhnzpv6.jpg","droontx6wa3lwqqlxn7v.jpg","fixr46yhnhwjizyyl7v7.webp","teilsluo387m9v2sfimv.webp"],
  "silla-francesa": ["b968upfzqwhwcza20cud.webp","f0usvrds2abueonem77w.webp","ar2jd1f6508rxzb1cuzx.webp","wsk2rrw75wakdzpi85pk.webp","gx3hzp2x72onzgwos9ez.webp","gskm7asdrki9j7rkindb.webp"],
  "espejo-ecurie-redondo": ["pmftwugdyd74omrwsxid.webp","kualqb0pmpvppmmadf2e.webp","ocufdkziqj74hk09kqp3.webp","i4vae1wt82rtvo6u0ivm.webp","c7cl8zlgjj8mz8sm3cdb.webp","tzsaxzcwdlkwax6qhf04.webp"],
  "set-cubiertos-pampas-heritage": ["bhkaa09ztcicem9m4yqu.webp","un5nmeafvhkmaofrkflm.webp","n8kt2w09i9k3gh2auhz2.webp","hntk9pelwf0u2hlpazqz.webp","sglgi8ugwh6aelshemhl.webp","pkcx9vl4ovyaj3rdnqp0.webp"],
  "ascot-edition": ["qv5vscabxkrocqgqvpzq.webp","y2e3roqrtag4qo7ladwf.jpg","g7gqgrstmdgbtaxqyyj8.jpg","gk2lzvoyfamzd5rzning.jpg","tdrjnjyp4dahwafz0c1j.jpg","bdm2lnesioerqcf46uyl.jpg"],
};

async function main() {
  let ok = 0, imgs = 0;
  const missing: string[] = [];
  for (const [slug, ids] of Object.entries(MAP)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) { missing.push(slug); continue; }
    await prisma.productImage.deleteMany({ where: { productId: product.id, colorId: null } });
    await prisma.productImage.createMany({
      data: ids.map((id, i) => ({
        productId: product.id,
        url: PREFIX + id,
        alt: `${product.name} ${i + 1}`,
        sortOrder: i,
      })),
    });
    ok++; imgs += ids.length;
  }
  console.log(`✅ ${ok} productos con imágenes, ${imgs} fotos guardadas.`);
  if (missing.length) console.log("⚠ Sin match:", missing.join(", "));
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
