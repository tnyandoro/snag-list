import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => res.json({ success: true, data: { properties: [], total: 0 } }));
router.get('/:id', (req, res) => res.json({ success: true, data: { id: req.params.id } }));
router.post('/', (req, res) => res.status(201).json({ success: true, data: { id: 'new' } }));
router.patch('/:id', (req, res) => res.json({ success: true, data: { id: req.params.id } }));
router.delete('/:id', (req, res) => res.status(204).send());
router.get('/:id/structure', (req, res) => res.json({ success: true, data: { property: {}, buildings: [] } }));
export default router;
